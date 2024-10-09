import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class DuplicatesTab extends StatefulWidget {
  final int userId;

  DuplicatesTab({required this.userId});

  @override
  _DuplicatesTabState createState() => _DuplicatesTabState();
}

class _DuplicatesTabState extends State<DuplicatesTab> {
  List<Map<String, dynamic>> stickers2 = [];

  @override
  void initState() {
    super.initState();
    fetchData();
  }

  Future<void> fetchData() async {
    try {
      final response1 = await http.post(
        Uri.parse("http://localhost:3001/stickers/zalepljeneSlicice"),
        body: json.encode({"idUser": widget.userId}),
        headers: {"Content-Type": "application/json"},
      );

      if (response1.statusCode == 200) {
        final data1 = json.decode(response1.body);
        List<int> tempList = [];
        for (var item in data1['slicice']) {
          tempList.add(item['idIgr']);
        }
        
        final response2 = await http.post(
          Uri.parse("http://localhost:3001/stickers/nezalepljeneSlicice"),
          body: json.encode({"idUser": widget.userId}),
          headers: {"Content-Type": "application/json"},
        );

        if (response2.statusCode == 200) {
          final data2 = json.decode(response2.body);
          List<int> tempList2 = [];
          for (var item in data2['slicice']) {
            if (tempList.contains(item['idIgr'])) {
              tempList2.add(item['idIgr']);
            }
          }

          List<dynamic> allSlicice = [];
          List<String> ekipe = ["Angola", "Dominican Republic", "Italy", "Philippines",
                                "China", "Puerto Rico", "Serbia", "South Sudan",
                                "Greece", "Jordan", "New Zealand", "USA",
                                "Egypt", "Lithuania", "Mexico", "Montenegro",
                                "Australia", "Finland", "Germany", "Japan",
                                "Cape Verde","Georgia", "Slovenia", "Venezuela",
                                "Brazil", "Iran", "Côte d'Ivoire", "Spain",
                                "Canada", "France", "Latvia", "Lebanon"];
          for (var ekipa in ekipe) {
            final response = await http.post(
              Uri.parse("http://localhost:3001/stickers/sliciceEkipa"),
              body: json.encode({"ekipa": ekipa}),
              headers: {"Content-Type": "application/json"},
            );

            if (response.statusCode == 200) {
              final data = json.decode(response.body);
              allSlicice.addAll(data['slicice']);
            }
          }

          List<Map<String, dynamic>> duplicates = [];
          for (var slicica in allSlicice) {
            if (tempList2.contains(slicica['idIgr'])) {
              duplicates.add(slicica);
            }
          }

          setState(() {
            stickers2 = duplicates;
          });
        }
      }
    } catch (error) {
      print("Error: $error");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          children: [
            Expanded(
              child: GridView.builder(
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 5, 
                  crossAxisSpacing: 100.0,
                  mainAxisSpacing: 100.0, 
                ),
                itemCount: stickers2.length,
                itemBuilder: (context, index) {
                  return Image.asset(
                    "assets/pictures/${stickers2[index]['picture1']}",
                    width: 130,
                    height: 176,
                    errorBuilder: (context, error, stackTrace) {
                      return Text("Image Not Found");
                    },
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
