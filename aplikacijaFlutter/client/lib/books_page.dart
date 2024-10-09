import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:url_launcher/url_launcher.dart';

class BooksTab extends StatefulWidget {
  final String username;
  final int userId;
  int packsToOpen;
  final Function(int) updatePacksToOpen;

  BooksTab({
    required this.username,
    required this.userId,
    required this.packsToOpen,
    required this.updatePacksToOpen,
  });

  @override
  _BooksTabState createState() => _BooksTabState();
}

class _BooksTabState extends State<BooksTab> {
  late PageController _pageController = PageController(initialPage: 0);
  int currentPage = 0;
  List<String> teams = [
    "Angola", "Dominican Republic", "Italy", "Philippines",
    "China", "Puerto Rico", "Serbia", "South Sudan",
    "Greece", "Jordan", "New Zealand", "USA",
    "Egypt", "Lithuania", "Mexico", "Montenegro",
    "Australia", "Finland", "Germany", "Japan",
    "Cape Verde", "Georgia", "Slovenia", "Venezuela",
    "Brazil", "Iran", "Côte d'Ivoire", "Spain",
    "Canada", "France", "Latvia", "Lebanon",
    "Special"
  ];
  List<List<dynamic>> stickersTeamData = List.generate(66, (index) => []);
  List<List<int>> userHas = List.generate(66, (index) => []);
  List<List<dynamic>> resultsData = List.generate(33, (index) => []);
  List<List<dynamic>> stickersToPutData = List.generate(33, (index) => []);
  bool hovered = false;

  int currentImage = 0;

  @override
  void initState() {
    super.initState();
    fetchDataForBookPair(currentPage);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> fetchDataForBookPair(int bookPairIndex) async {
    stickersTeamData[2 * bookPairIndex].clear();
    stickersTeamData[2 * bookPairIndex + 1].clear();
    userHas[2 * bookPairIndex].clear();
    userHas[2 * bookPairIndex + 1].clear();
    stickersToPutData[bookPairIndex].clear();
    resultsData[bookPairIndex].clear();
    
    final headers = {
      'Content-Type': 'application/json; charset=UTF-8',
    };
    
    final response = await http.post(
      Uri.parse('http://localhost:3001/stickers/sliciceEkipa'),
      headers: headers,
      body: jsonEncode({
        'ekipa': teams[bookPairIndex],
      }),
    );

    final stickersTeamDataResponse = jsonDecode(response.body);
    List<dynamic> sliciceList = stickersTeamDataResponse['slicice'];

    for (int i = 0; i < sliciceList.length ~/ 2; i++) {
      stickersTeamData[2 * bookPairIndex].add(sliciceList[i]);
    }
    for (int i = sliciceList.length ~/ 2; i < sliciceList.length; i++) {
      stickersTeamData[2 * bookPairIndex + 1].add(sliciceList[i]);
    }
    
    final response2 = await http.post(
      Uri.parse('http://localhost:3001/stickers/zalepljeneSliciceEkipa'),
      headers: headers,
      body: jsonEncode({
        'ekipa': teams[bookPairIndex],
        'idUser': widget.userId,
      }),
    );
    
    final userHasResponse = jsonDecode(response2.body);
    List<dynamic> sliciceList2 = userHasResponse['slicice'];
    
    for (int i = 0; i < sliciceList2.length; i++) {
      userHas[2 * bookPairIndex].add(sliciceList2[i]['idIgr']);
      userHas[2 * bookPairIndex + 1].add(sliciceList2[i]['idIgr']);
    }
    
    final response3 = await http.post(
      Uri.parse('http://localhost:3001/stickers/nezalepljeneSliciceEkipa'),
      headers: headers,
      body: jsonEncode({
        'ekipa': teams[bookPairIndex],
        'idUser': widget.userId,
      }),
    );
    
    final stickersToPutDataResponse = jsonDecode(response3.body);
    List<dynamic> sliciceList3 = stickersToPutDataResponse['slicice'];
    
    for (int i = 0; i < sliciceList3.length; i++) {
      stickersToPutData[bookPairIndex].add(sliciceList3[i]);
    }

    final response4 = await http.post(
      Uri.parse('http://localhost:3001/stickers/dohvatiRezultateEkipe'),
      headers: headers,
      body: jsonEncode({
        'ekipa': teams[bookPairIndex],
      }),
    );

    final resultsDataResponse = jsonDecode(response4.body);
    List<dynamic> resultsList = resultsDataResponse['rezultati'];

    for(int i = 0; i < resultsList.length; i++){
      resultsData[bookPairIndex].add(resultsList[i]);
    }

    setState(() {});
  }

  void nextPage() {
    if (currentPage < 32) {
      currentPage++;
      _pageController.animateToPage(currentPage,
          duration: Duration(milliseconds: 300), curve: Curves.easeInOut);
      fetchDataForBookPair(currentPage);
    }
  }

  void previousPage() {
    if (currentPage > 0) {
      currentPage--;
      _pageController.animateToPage(currentPage,
          duration: Duration(milliseconds: 300), curve: Curves.easeInOut);
      fetchDataForBookPair(currentPage);
    }
  }

  void nextImage() {
    final totalImages = stickersToPutData[currentPage].length;
    if (currentImage < totalImages - 1) {
      setState(() {
        currentImage++;
      });
    }
  }

  Future<void> stickSticker() async {
    final headers = {
      'Content-Type': 'application/json; charset=UTF-8',
    };

    await http.post(
      Uri.parse('http://localhost:3001/stickers/zalepiSlicicu'),
      headers: headers,
      body: jsonEncode({
        'idNez': stickersToPutData[currentPage][currentImage]['idNez'],
        'idIgr': stickersToPutData[currentPage][currentImage]['idIgr'],
        'idUser': widget.userId,
      }),
    );

    if(userHas[2 * currentPage].length == 11){
      
      await http.post(
      Uri.parse('http://localhost:3001/users/dodajKorisnikuKesicu'),
      headers: headers,
      body: jsonEncode({
        'packsToOpen': widget.packsToOpen,
        'idUser': widget.userId,
      }),
    );

    widget.updatePacksToOpen(widget.packsToOpen + 1);
    }    
    currentImage = 0;
    fetchDataForBookPair(currentPage);
  }

  void previousImage() {
    if (currentImage > 0) {
      setState(() {
        currentImage--;
      });
    }
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(
      body: Center(
        child: SizedBox(
          height: 1000,
          width: 1000,
          child: Row(
            children: [
              Expanded(
                child: Column(
                  children: [
                    Expanded(
                      child: PageView.builder(
                        controller: _pageController,
                        itemCount: 33,
                        itemBuilder: (BuildContext context, int index) {
                          return BookPair(
                            firstPage: BookPage(
                              page: 2 * index,
                              userId: widget.userId,
                              username: widget.username,
                              team: teams[index],
                              stickersTeam: stickersTeamData[2 * index],
                              userHas: userHas[2 * index],
                            ),
                            secondPage: BookPage(
                              page: 2 * index + 1,
                              userId: widget.userId,
                              username: widget.username,
                              team: teams[index],
                              stickersTeam: stickersTeamData[2 * index + 1],
                              userHas: userHas[2 * index + 1],
                            ),
                          );
                        },
                      ),
                    ),
                    SizedBox(height: 10),
                    Text("Pages ${currentPage * 2 + 1}/${currentPage * 2 + 2} out of 66"),
                    SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        IconButton(
                          icon: Icon(Icons.arrow_back),
                          onPressed: previousPage,
                          color: currentPage > 0 ? Colors.blue : Colors.grey,
                        ),
                        IconButton(
                          icon: Icon(Icons.arrow_forward),
                          onPressed: nextPage,
                          color: currentPage < 32 ? Colors.blue : Colors.grey,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              SizedBox(width: 20),
              if (stickersToPutData[currentPage].isNotEmpty)
              
                SizedBox(
                  width: 300,
                  child: Column(
                    children: [
                      if (resultsData[currentPage].isNotEmpty) ...resultsData[currentPage].map((result) {
                        final team = teams[currentPage];
                        final tim1 = result['tim1'];
                        final tim2 = result['tim2'];
                        final poeni1 = result['poeni1'];
                        final poeni2 = result['poeni2'];
                        final link = result['link'];
                        final odigrano = result['odigrano'];

                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 5.0),
                          child: odigrano == 1 ? InkWell(
                            onTap: () async {
                              final url = Uri.parse(link);
                              if (await canLaunchUrl(url)) {
                                await launchUrl(url);
                              } else {
                                throw 'Could not launch $url';
                              }
                            },
                            child: RichText(
                              text: TextSpan(
                                children: [
                                  TextSpan(
                                    text: tim1,
                                    style: TextStyle(
                                      fontWeight: tim1 == team ? FontWeight.bold : FontWeight.normal,
                                      color: Colors.black,
                                      fontSize: 16,
                                    ),
                                  ),
                                  TextSpan(
                                    text: " - ",
                                    style: TextStyle(
                                      fontWeight: FontWeight.normal,
                                      color: Colors.black,
                                      fontSize: 16,
                                    ),
                                  ),
                                  TextSpan(
                                    text: tim2,
                                    style: TextStyle(
                                      fontWeight: tim2 == team ? FontWeight.bold : FontWeight.normal,
                                      color: Colors.black,
                                      fontSize: 16,
                                    ),
                                  ),
                                  TextSpan(
                                    text: "  $poeni1 - $poeni2",
                                    style: TextStyle(
                                      fontWeight: FontWeight.normal,
                                      color: Colors.black,
                                      fontSize: 16,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          )
                          : RichText(
                              text: TextSpan(
                                children: [
                                  TextSpan(
                                    text: tim1,
                                    style: TextStyle(
                                      fontWeight: tim1 == team ? FontWeight.bold : FontWeight.normal,
                                      color: Colors.black,
                                      fontSize: 16,
                                    ),
                                  ),
                                  TextSpan(
                                    text: " - ",
                                    style: TextStyle(
                                      fontWeight: FontWeight.normal,
                                      color: Colors.black,
                                      fontSize: 16,
                                    ),
                                  ),
                                  TextSpan(
                                    text: tim2,
                                    style: TextStyle(
                                      fontWeight: tim2 == team ? FontWeight.bold : FontWeight.normal,
                                      color: Colors.black,
                                      fontSize: 16,
                                    ),
                                  ),
                                  TextSpan(
                                    text: " TO BE PLAYED",
                                    style: TextStyle(
                                      fontWeight: FontWeight.normal,
                                      color: Colors.black,
                                      fontSize: 16,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                        );
                      }),
                      Container(
                        width: 130,
                        height: 176,
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: Colors.black,
                            width: 2.0,
                          ),
                        ),
                        child: InkWell(
                          onTap: () {
                            if(stickersToPutData[currentPage][currentImage]['ekipa'] != "Special"){
                              Navigator.of(context).push(MaterialPageRoute(
                                builder: (context) => OtherPage(
                                  item: stickersToPutData[currentPage][currentImage],
                                ),
                              ));
                            }
                          },
                          onHover: (isHovering) {
                            setState(() {
                              hovered = isHovering;
                            });
                          },
                          child: Stack(
                            children: [
                              Positioned.fill(
                                child: Offstage(
                                  offstage: hovered,
                                  child: Image.asset(
                                    'assets/pictures/${stickersToPutData[currentPage][currentImage]['picture1']}',
                                    width: 130,
                                    height: 176,
                                  ),
                                ),
                              ),
                              Positioned.fill(
                                child: Offstage(
                                  offstage: !hovered,
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Container(
                                        height: 176/2 - 2,
                                        color: Colors.black,
                                        child: Center(
                                          child: Text(
                                            '${stickersToPutData[currentPage][currentImage]['ime']} ${stickersToPutData[currentPage][currentImage]['prezime']}',
                                            style: TextStyle(
                                              color: Colors.white,
                                              fontSize: 16.0,
                                            ),
                                          ),
                                        ),
                                      ), 
                                      Container(
                                        height: 176/2 - 2,
                                        color: Colors.black,
                                        child: Center(
                                          child: Text(
                                            '${stickersToPutData[currentPage][currentImage]['idIgr']}',
                                            style: TextStyle(
                                              color: Colors.white,
                                              fontSize: 24.0,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              
                            ],
                          ),
                        ),
                      
                      ),
                      SizedBox(height: 10),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          IconButton(
                            icon: Icon(Icons.arrow_back),
                            onPressed: previousImage,
                            color: currentImage > 0 ? Colors.blue : Colors.grey,
                          ),
                          ElevatedButton(
                            onPressed: stickSticker,
                            child: Text("Zalepi"),
                          ),
                          IconButton(
                            icon: Icon(Icons.arrow_forward),
                            onPressed: nextImage,
                            color: currentImage < stickersToPutData[currentPage].length - 1
                                ? Colors.blue
                                : Colors.grey,
                          ),
                        ],
                      ),
                      
                    ],
                  ),
                ),
              
                if (stickersToPutData[currentPage].isEmpty)
                SizedBox(
                  width: 300,
                  child: Column(
                    children: [
                      if (resultsData[currentPage].isNotEmpty) ...resultsData[currentPage].map((result) {
                        final team = teams[currentPage];
                        final tim1 = result['tim1'];
                        final tim2 = result['tim2'];
                        final poeni1 = result['poeni1'];
                        final poeni2 = result['poeni2'];
                        final link = result['link'];
                        final odigrano = result['odigrano'];

                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 5.0),
                          child: odigrano == 1 ? InkWell(
                            onTap: () async {
                              final url = Uri.parse(link);
                              if (await canLaunchUrl(url)) {
                                await launchUrl(url);
                              } else {
                                throw 'Could not launch $url';
                              }
                            },
                            child: RichText(
                              text: TextSpan(
                                children: [
                                  TextSpan(
                                    text: tim1,
                                    style: TextStyle(
                                      fontWeight: tim1 == team? FontWeight.bold : FontWeight.normal,
                                      color: Colors.black,
                                      fontSize: 16,
                                    ),
                                  ),
                                  TextSpan(
                                    text: " - ",
                                    style: TextStyle(
                                      fontWeight: FontWeight.normal,
                                      color: Colors.black,
                                      fontSize: 16,
                                    ),
                                  ),
                                  TextSpan(
                                    text: tim2,
                                    style: TextStyle(
                                      fontWeight:tim2 == team ? FontWeight.bold : FontWeight.normal,
                                      color: Colors.black,
                                      fontSize: 16,
                                    ),
                                  ),
                                  TextSpan(
                                    text: "  $poeni1 - $poeni2",
                                    style: TextStyle(
                                      fontWeight: FontWeight.normal,
                                      color: Colors.black,
                                      fontSize: 16,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          )
                          : RichText(
                              text: TextSpan(
                                children: [
                                  TextSpan(
                                    text: tim1,
                                    style: TextStyle(
                                      fontWeight: tim1 == team? FontWeight.bold : FontWeight.normal,
                                      color: Colors.black,
                                      fontSize: 16,
                                    ),
                                  ),
                                  TextSpan(
                                    text: " - ",
                                    style: TextStyle(
                                      fontWeight: FontWeight.normal,
                                      color: Colors.black,
                                      fontSize: 16,
                                    ),
                                  ),
                                  TextSpan(
                                    text: tim2,
                                    style: TextStyle(
                                      fontWeight:tim2 == team ? FontWeight.bold : FontWeight.normal,
                                      color: Colors.black,
                                      fontSize: 16,
                                    ),
                                  ),
                                  TextSpan(
                                    text: " TO BE PLAYED",
                                    style: TextStyle(
                                      fontWeight: FontWeight.normal,
                                      color: Colors.black,
                                      fontSize: 16,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                        );
                      }).toList(),
                    ]
                  )
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class BookPair extends StatefulWidget {
  final StatefulWidget firstPage;
  final StatefulWidget secondPage;

  BookPair({
    required this.firstPage,
    required this.secondPage,
  });

  @override
  _BookPairState createState() => _BookPairState();
}

class _BookPairState extends State<BookPair> {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: widget.firstPage),
        SizedBox(width: 4),
        Expanded(child: widget.secondPage),
      ],
    );
  }
}


class BookPage extends StatefulWidget {
  final int page;
  final int userId;
  final String username;
  final String team;
  final List<dynamic> stickersTeam;
  final List<int> userHas;

  BookPage({
    required this.page,
    required this.userId,
    required this.username,
    required this.team,
    required this.stickersTeam,
    required this.userHas,
  });

  @override
  _BookPageState createState() => _BookPageState();
}

class _BookPageState extends State<BookPage> {
  List<bool> hovered = [];

  @override
  void initState() {
    super.initState();
    hovered = List<bool>.filled(6, false);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.blueGrey.shade100,
      child: Padding(
        padding: const EdgeInsets.only(top: 30, left: 20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Expanded(
              child: GridView.builder(
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 30.0,
                  mainAxisSpacing: 30.0,
                ),
                itemCount: widget.stickersTeam.length,
                itemBuilder: (BuildContext context, int index) {
                  final item = widget.stickersTeam[index] as Map<String, dynamic>;
                  final idIgr = item['idIgr'] as int?;
                  final picture1 = item['picture1'] as String?;
                  final displayPicture = idIgr != null && widget.userHas.contains(idIgr)
                      ? picture1 ?? 'default.png'
                      : 'default.png';
                  
                  final ime = item['ime'] as String?;
                  final prezime = item['prezime'] as String?;
                  final brSlicice = item['brSlicice'] as int?;
                  final ekipa = item['ekipa'] as String?;

                  return Container(
                    height: 176,
                    width: 130,
                    child: InkWell(
                      onTap: () {
                        if (idIgr != null && widget.userHas.contains(idIgr) && ekipa != "Special") {
                          Navigator.of(context).push(MaterialPageRoute(
                            builder: (context) => OtherPage(item: item),
                          ));
                        }
                      },
                      onHover: (isHovering) {
                        setState(() {
                          hovered[index] = isHovering;
                        });
                      },
                      child: Stack(
                        children: [
                          Positioned.fill(
                            child: Offstage(
                              offstage: hovered[index],
                              child: Image.asset(
                                'assets/pictures/$displayPicture',
                                width: 130,
                                height: 176,
                              ),
                            ),
                          ),
                          Positioned.fill(
                            child: Offstage(
                              offstage: !hovered[index],
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Container(
                                    height: 176/2 - 16,
                                    width: 100,
                                    color: Colors.black,
                                    child: Center(
                                      child: Text(
                                        '${ime} ${prezime}',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 10.0,
                                        ),
                                      ),
                                    ),
                                  ), 
                                  Container(
                                    height: 176/2 - 16,
                                    width: 100,
                                    color: Colors.black,
                                    child: Center(
                                      child: Text(
                                        '${idIgr}',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 24.0,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          if (idIgr != null && !widget.userHas.contains(idIgr) && brSlicice != null)
                          Positioned.fill(child: Offstage(
                            offstage: hovered[index],
                            child: Center(
                              child: Container(
                                padding: EdgeInsets.all(4),
                                decoration: BoxDecoration(
                                  color: Colors.black, 
                                  shape: BoxShape.circle,
                                ),
                                child: Text(
                                  brSlicice.toString(),
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 24,
                                  ),
                                ),
                              ),
                            ),
                          ))
                            
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class OtherPage extends StatelessWidget {
  final Map<String, dynamic> item;

  OtherPage({required this.item});

  @override
  Widget build(BuildContext context) {
    final ime = item['ime'];
    final prezime = item['prezime'];
    final image = item['picture1'];
    final pozicija = item['pozicija'];
    final visina = item['visina'];
    final tezina = item['tezina'];
    final reprezentacija = item['ekipa'];
    final klub = item['klub'];

    return Scaffold(
      appBar: AppBar(title: Text('$ime $prezime')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(
              width: 130,
              height: 176,
              child: Image.asset(
                "assets/pictures/$image",
                fit: BoxFit.cover,
              ),
            ),
            SizedBox(height: 20),
            Text('First name: $ime'),
            Text('Last name: $prezime'),
            Text('Position: $pozicija'),
            Text('Height: $visina'),
            Text('Weight: $tezina'),
            Text('National team: $reprezentacija'),
            Text('Club: $klub'),
          ],
        ),
      ),
    );
  }
}
