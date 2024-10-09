import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class TradeTab extends StatefulWidget {
  final int idUser;
  bool hasRequest = false;

  TradeTab({required this.idUser});

  @override
  _TradeTabState createState() => _TradeTabState();
}

class _TradeTabState extends State<TradeTab> {
  List<Map<String, dynamic>> dataList = [];
  Set<int> selectedIds1 = {};
  Set<int> selectedIds2 = {};
  Set<int> myIds = {};
  Set<int> myUnstickIds = {};
  Set<int> allIgrIds = {};
  int acceptDuplicates = 0;
  bool isChecked = false;

  @override
  void initState() {
    super.initState();
    fetchData();
  }

  Future<void> fetchData() async {
    try {

      final responsetrades = await http.post(
        Uri.parse("http://localhost:3001/stickers/korisnikoveRazmene"),
        body: json.encode({"idUser": widget.idUser}),
        headers: {"Content-Type": "application/json"},
      );

      final data = json.decode(responsetrades.body);

      List<dynamic> myTrades = data['razmene'];
      if(myTrades.length > 0) widget.hasRequest = true;

      final response = await http.post(
        Uri.parse('http://localhost:3001/stickers/nezalepljeneSlicice'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'idUser': widget.idUser}),
      );

      if (response.statusCode == 200) {
        final Map<dynamic, dynamic> responseData = jsonDecode(response.body);
        final List<dynamic> data = responseData['slicice'] ?? [];
        setState(() {
          dataList = data.map((item) => item as Map<String, dynamic>).toList();
          myUnstickIds = Set.from(data.map((item) => item['idIgr']));
        });
      } else {
        print('Failed to load data. Status code: ${response.statusCode}');
      }
    } catch (error) {
      print('Error: $error');
    }

    final response2 = await http.post(
      Uri.parse('http://localhost:3001/stickers/zalepljeneSlicice'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'idUser': widget.idUser}),
    );

    final Map<dynamic, dynamic> responseData2 = jsonDecode(response2.body);
    final List<dynamic> data2 = responseData2['slicice'] ?? [];

    setState(() {
      myIds = Set.from(data2.map((item) => item['idIgr']));
    });

    myUnstickIds = myUnstickIds.difference(myIds);


    setState(() {
      selectedIds1 = Set.from(dataList
          .where((item) => myIds.contains(item['idIgr']))
          .map((item) => item['idNez']));
    });

    final response3 = await http.get(
      Uri.parse('http://localhost:3001/stickers/sveSlicice'),
    );

    final Map<dynamic, dynamic> responseData3 = jsonDecode(response3.body);
    final List<dynamic> data3 = responseData3['slicice'] ?? [];
    setState(() {
      allIgrIds = Set.from(data3.map((item) => item['idIgr']));
    });

    setState(() {
      selectedIds2 = Set.from(allIgrIds.where((item) => !myIds.contains(item) && !myUnstickIds.contains(item)));
      
    });
  }

  void toggleSelection1(int idNez) {
    setState(() {
      if (selectedIds1.contains(idNez)) {
        selectedIds1.remove(idNez);
      } else {
        selectedIds1.add(idNez);
      }
    });
  }

  void toggleSelection2(int idIgr) {
    setState(() {
      if (selectedIds2.contains(idIgr)) {
        selectedIds2.remove(idIgr);
      } else {
        selectedIds2.add(idIgr);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    if(widget.hasRequest){
      return Center(
      child: Text('You have already made a request!'),
    );

    }
    else {return Center(
      child: SingleChildScrollView(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
             Container(
              padding: EdgeInsets.symmetric(vertical: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 20,
                        height: 20,
                        margin: EdgeInsets.only(right: 8),
                        decoration: BoxDecoration(
                          color: Colors.green.withOpacity(0.5),
                          border: Border.all(color: Colors.black),
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      Text("In album"),
                    ],
                  ),
                  SizedBox(width: 20),
                  Row(
                    children: [
                      Container(
                        width: 20,
                        height: 20,
                        margin: EdgeInsets.only(right: 8),
                        decoration: BoxDecoration(
                          color: Colors.orange.withOpacity(0.5),
                          border: Border.all(color: Colors.black),
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      Text("In possession, not in album yet"),
                    ],
                  ),
                  SizedBox(width: 20),
                  Row(
                    children: [
                      Container(
                        width: 20,
                        height: 20,
                        margin: EdgeInsets.only(right: 8),
                        decoration: BoxDecoration(
                          color: Colors.red.withOpacity(0.5),
                          border: Border.all(color: Colors.black),
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      Text("Missing"),
                    ],
                  ),
                ],
              ),
            ),
            if (dataList.isNotEmpty)
              Column(
                children: [
                  Column(
                    children: [
                      Text(
                        'I offer:',
                        style: TextStyle(fontSize: 14),
                      ),
                      Container(
                        height: 140,
                        child: GridView.builder(
                          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 24,
                            crossAxisSpacing: 4.0,
                            mainAxisSpacing: 4.0,
                          ),
                          itemCount: dataList.length,
                          itemBuilder: (context, index) {
                            int idNez = dataList[index]['idNez'];
                            int idIgr = dataList[index]['idIgr'];

                            Color backgroundColor = myIds.contains(idIgr)
                                ? Colors.green.withOpacity(0.5)
                                :(myUnstickIds.contains(idIgr)? Colors.orange.withOpacity(0.5) : Colors.red.withOpacity(0.5));

                            return GestureDetector(
                              onTap: () {
                                toggleSelection1(idNez);
                              },
                              child: Container(
                                width: 20,
                                height: 20,
                                margin: EdgeInsets.all(5),
                                padding: EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  border: Border.all(
                                    color: selectedIds1.contains(idNez)
                                        ? Colors.blue
                                        : Colors.black,
                                  ),
                                  borderRadius: BorderRadius.circular(4),
                                  color: backgroundColor,
                                ),
                                child: Center(
                                  child: Text(
                                    '$idIgr',
                                    style: TextStyle(fontSize: 8),
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 20),
                  Column(
                    children: [
                      Text(
                        'I want:',
                        style: TextStyle(fontSize: 14),
                      ),
                      Container(
                        height: 325,
                        child: GridView.builder(
                          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 24,
                            crossAxisSpacing: 4.0,
                            mainAxisSpacing: 4.0,
                          ),
                          itemCount: allIgrIds.length,
                          itemBuilder: (context, index) {
                            int idIgr = allIgrIds.elementAt(index);

                            Color backgroundColor = myIds.contains(idIgr)
                                ? Colors.green.withOpacity(0.5)
                                :(myUnstickIds.contains(idIgr)? Colors.orange.withOpacity(0.5) : Colors.red.withOpacity(0.5));

                            return GestureDetector(
                              onTap: () {
                                toggleSelection2(idIgr);
                              },
                              child: Container(
                                width: 20,
                                height: 20,
                                margin: EdgeInsets.all(5),
                                padding: EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  border: Border.all(
                                    color: selectedIds2.contains(idIgr)
                                        ? Colors.blue
                                        : Colors.black,
                                  ),
                                  borderRadius: BorderRadius.circular(4),
                                  color: backgroundColor,
                                ),
                                child: Center(
                                  child: Text(
                                    '$idIgr',
                                    style: TextStyle(fontSize: 8),
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 10),
                  Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Checkbox(
                          value: isChecked,
                          onChanged: (value) {
                            setState(() {
                              isChecked = value!;
                              if(value == true){
                                acceptDuplicates = 1;
                              }
                              else{
                                acceptDuplicates = 0;
                              }
                              
                            });
                          },
                        ),
                        Text("Accept duplicates"), // Adjust text as needed
                      ],
                    ),
                  ElevatedButton(
                    onPressed: () async {
                      List<Map<String, dynamic>> selectedData1 = dataList
                          .where((item) =>
                              selectedIds1.contains(item['idNez']))
                          .toList();

                      List<int> selectedData2 = allIgrIds
                          .where((idIgr) => selectedIds2.contains(idIgr))
                          .toList();

                      final response = await http.post(
                        Uri.parse('http://localhost:3001/stickers/napraviRazmenu'),
                        headers: {'Content-Type': 'application/json'},
                        body: jsonEncode({'idUser': widget.idUser, 'acceptDuplicates': acceptDuplicates}),
                      );

                      final Map<dynamic, dynamic> responseData = jsonDecode(response.body);

                      dynamic idRaz = (responseData['idRaz']);

                      final response2 = await http.post(
                        Uri.parse('http://localhost:3001/stickers/ponudiSlicice'),
                        headers: {'Content-Type': 'application/json'},
                        body: jsonEncode({'idRaz': idRaz, 'ponuda': selectedData1}),
                      );

                      final response3 = await http.post(
                        Uri.parse('http://localhost:3001/stickers/pozeliSlicice'),
                        headers: {'Content-Type': 'application/json'},
                        body: jsonEncode({'idRaz': idRaz, 'ponuda': selectedData2}),
                      );

                      widget.hasRequest = true;

                      
                    },
                    child: Text('Submit'),
                  ),
                ],
              ),
            if (dataList.isEmpty)
              Text(
                'No data available',
                style: TextStyle(fontSize: 18),
              ),
          ],
        ),
      ),
    );
    }
  }

  
}



