import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class PackTab extends StatefulWidget {
  final int userId;
  final String username;
  final String lastOpen;
  int packsToOpen;
  final Function(String) updateLastOpen;
  final Function(int) updatePacksToOpen;

  PackTab({
    required this.userId,
    required this.username,
    required this.lastOpen,
    required this.packsToOpen,
    required this.updateLastOpen,
    required this.updatePacksToOpen,
  });

  @override
  _PackTabState createState() => _PackTabState();
}

class _PackTabState extends State<PackTab> with SingleTickerProviderStateMixin {
  int currentIndex = 0;
  List<dynamic>? stickers;
  Timer? timer;
  Duration timeLeft = Duration.zero;
  int newStickers = 0;
  int oldStickers = 0;

  late AnimationController animation_controller;
  late Animation<double> animation_pack;
  bool is_animating = false;

  @override
  void initState() {
    super.initState();
    startTimer();
    animation_controller = AnimationController(
      vsync: this,
      duration: Duration(seconds: 1),
    );

    animation_pack = Tween<double>(begin: 1.0, end: 1.5).animate(animation_controller)
      ..addStatusListener((status) {
        if (status == AnimationStatus.completed) {
          setState(() {
            is_animating = false;
          });
          fetchStickers();
          animation_controller.reset();
        }
      });
  }

  @override
  void dispose() {
    timer?.cancel();
    animation_controller.dispose();
    super.dispose();
  }

  void startTimer() {
    timer = Timer.periodic(Duration(seconds: 1), (timer) {
      setState(() {
        timeLeft = calculateTimeLeft();
      });
    });
  }

  Duration calculateTimeLeft() {
    final lastOpenDateTime = DateTime.parse(widget.lastOpen);
    final currentTime = DateTime.now();
    final timeDifference = currentTime.difference(lastOpenDateTime);
    final timeUntilUpdate = Duration(hours: 3) - timeDifference;
    return timeUntilUpdate > Duration.zero && widget.packsToOpen == 0 ? timeUntilUpdate : Duration.zero;
  }

  void updateLastOpen(String lastOpen) {
    widget.updateLastOpen(lastOpen);
  }

  void showNextSticker() {
    if (stickers != null && stickers!.isNotEmpty) {
      setState(() {
        currentIndex = (currentIndex + 1) % stickers!.length;
      });
    }
  }

  void showPreviousSticker() {
    if (stickers != null && stickers!.isNotEmpty) {
      setState(() {
        currentIndex = (currentIndex - 1 + stickers!.length) % stickers!.length;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              stickers != null && stickers!.isNotEmpty
                  ? SizedBox(
                      height: 176,
                      width: 130 * 5 + 16 * 5,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: stickers!.length,
                        itemBuilder: (context, index) {
                          return Padding(
                            padding: EdgeInsets.symmetric(horizontal: 8.0),
                            child: Center(
                              child: SizedBox(
                                width: 130,
                                child: Image.asset(
                                  'assets/pictures/${stickers![index]['picture1']}',
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    )
                  : SizedBox(
                      child: Image.asset(
                        'assets/pictures/pack.png',
                      ),
                      width: 140,
                      height: 186,
                    ),
              SizedBox(height: 20),
              ElevatedButton(
                onPressed: canUpdateLastOpen() ? start_animation : null,
                child: Text('Open pack'),
              ),
              SizedBox(height: 10),
              Text(
                'Time left until next pack is available: ${formatDuration(timeLeft)}',
                style: TextStyle(fontSize: 16),
              ),
              SizedBox(height: 20),
              if (newStickers + oldStickers == 5)
                Text("New stickers: ${newStickers}; old stickers: ${oldStickers}"),
              if (newStickers + oldStickers == 0)
                Text("Pack has not been opened yet!"),
            ],
          ),
        ),
        if (is_animating)
          Positioned.fill(
            child: AnimatedBuilder(
              animation: animation_pack,
              builder: (context, child) {
                return Transform.scale(
                  scale: animation_pack.value,
                  child: child,
                );
              },
              child: Container(
                color: Colors.white,
                child: Center(
                  child: Image.asset(
                    'assets/pictures/pack.png',
                    width: 140,
                    height: 186,
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }

  void start_animation() {
    setState(() {
      is_animating = true;
    });
    animation_controller.forward();
  }

  String formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
//    String twoDigitMinutes = twoDigits(duration.inMinutes.remainder(60));
    String twoDigitMinutes = duration.inMinutes.remainder(60).toString().padLeft(2, '0');
//    String twoDigitSeconds = twoDigits(duration.inSeconds.remainder(60));
    String twoDigitSeconds = duration.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '${duration.inHours}:$twoDigitMinutes:$twoDigitSeconds';
  }

  bool canUpdateLastOpen() {
    final lastOpenDateTime = DateTime.parse(widget.lastOpen);
    final currentTime = DateTime.now();
    final timeDifference = currentTime.difference(lastOpenDateTime);
    return (timeDifference.inHours >= 3 || widget.packsToOpen > 0) && (stickers == null || stickers!.isEmpty);
  }

  Future<void> fetchStickers() async {
    final response1 = await http.post(
      Uri.parse('http://localhost:3001/stickers/nezalepljeneSlicice'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'idUser': widget.userId}),
    );

    final response2 = await http.post(
      Uri.parse('http://localhost:3001/stickers/zalepljeneSlicice'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'idUser': widget.userId}),
    );

    final Map<dynamic, dynamic> responseData1 = jsonDecode(response1.body);
    final List<dynamic> data1 = responseData1['slicice'] ?? [];
    final myUnstickIds = Set.from(data1.map((item) => item['idIgr']));
    final Map<dynamic, dynamic> responseData2 = jsonDecode(response2.body);
    final List<dynamic> data2 = responseData2['slicice'] ?? [];
    final myIds = Set.from(data2.map((item) => item['idIgr']));
    print(myUnstickIds);
    print(myIds);
    try {
      final headers = {
        'Content-Type': 'application/json; charset=UTF-8',
      };
      final response = await http.post(
        Uri.parse('http://localhost:3001/stickers/otvoriKesicu'),
        headers: headers,
        body: jsonEncode({
          'idUser': widget.userId,
          'packsToOpen': widget.packsToOpen,
        }),
      );

      if (response.statusCode == 200) {
        final stickersOpened = jsonDecode(response.body);
        stickers = stickersOpened['slicice'];

        final Map<dynamic, dynamic> responseData = jsonDecode(response.body);
        final List<dynamic> data = responseData['slicice'] ?? [];
        final openedIds = Set.from(data.map((item) => item['idIgr']));
        List<dynamic> matchingIds = openedIds.where((id) => myIds.contains(id) || myUnstickIds.contains(id)).toList();

        oldStickers = matchingIds.length;
        newStickers = 5 - oldStickers;

        if (stickers != null && stickers!.isNotEmpty) {
          updateLastOpen(stickersOpened['apdejtovanKorisnik']['datumPoslednjegOtvaranja']);
          widget.updatePacksToOpen(stickersOpened['apdejtovanKorisnik']['packsToOpen']);
        }
      } else {
        throw Exception('Failed to load stickers');
      }
    } catch (e) {
      print('Error fetching stickers: $e');
    }
  }
}

