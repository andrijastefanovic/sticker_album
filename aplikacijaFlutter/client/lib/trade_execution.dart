import 'dart:math';

import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class TradeRequest {
    int idRaz = 1;
    int idUser = 1;
    List<int> offered = [];
    List<int> wanted = [];
    int acceptDuplicates = -1;

    TradeRequest(this.idRaz, this.idUser, this.acceptDuplicates){}

    @override
    String toString(){
      return idRaz.toString() + " " + idUser.toString() + " " + offered.toString() + " " + wanted.toString();
    }


}

class TradeToExecute {
  int firstId = -1;
  int secondId = -1;
  List<int> firstToSecond = [];
  List<int> secondToFirst = [];
  int firstUser = -1;
  int secondUser = -1;
  int firstPlaceInTrade = -1;
  int secondPlaceInTrade = -1;

  TradeToExecute(this.firstId, this.secondId, this.firstToSecond, this.secondToFirst, this.firstUser, this.secondUser, this.firstPlaceInTrade, this.secondPlaceInTrade){}

  @override
  String toString() {
    return "First Id: " + firstId.toString() + "\n Second Id: " + secondId.toString() + "\n First to Second: " + firstToSecond.toString() +
    "\n Second to first:" + secondToFirst.toString() + "\n First user: " + firstUser.toString() + "\n Second user: " + secondUser.toString();
  }
}

List<int> removeFirstOccurance(List<int> firstList, List<int> secondList){
   Map<int, int> secondMap = {};

  for (int element in secondList) {
    secondMap[element] = (secondMap[element] ?? 0) + 1;
  }

  firstList.removeWhere((element) {
    if (secondMap.containsKey(element) && secondMap[element]! > 0) {
      secondMap[element] = secondMap[element]! - 1;
      return true;
    }
    return false;
  });

  return firstList; 
}

class TradeExecutionTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: ElevatedButton(
        onPressed: () async {
          List<TradeRequest> allRequests = [];
          
          final response = await http.get(
          Uri.parse('http://localhost:3001/stickers/dohvatiRazmene'),
          );
          final Map<dynamic, dynamic> responseData = jsonDecode(response.body);
          final List<dynamic> data = responseData['razmene'] ?? [];
          for(int i = 0; i < data.length; i++){
              allRequests.add(TradeRequest(data[i]['idRaz'], data[i]['idUser'], data[i]['acceptDuplicates']));
          }

          final response2 = await http.get(
          Uri.parse('http://localhost:3001/stickers/dohvatiPonude'),
          );

          final Map<dynamic, dynamic> responseData2 = jsonDecode(response2.body);
          final List<dynamic> data2 = responseData2['ponude'] ?? [];


          for(int i = 0; i < data2.length; i++){
            TradeRequest requestToUpdate = allRequests.firstWhere((request) => request.idRaz == data2[i]['idRaz']);
            requestToUpdate.offered.add(data2[i]['idIgr']);
          }

          final response3 = await http.get(
          Uri.parse('http://localhost:3001/stickers/dohvatiZelje'),
          );

          final Map<dynamic, dynamic> responseData3 = jsonDecode(response3.body);
          final List<dynamic> data3 = responseData3['zelje'] ?? [];


          for(int i = 0; i < data3.length; i++){
            TradeRequest requestToUpdate = allRequests.firstWhere((request) => request.idRaz == data3[i]['idRaz']);
            requestToUpdate.wanted.add(data3[i]['idIgr']);
          }

          

          /*

          for(int i = 0; i < 10; i++){
            allRequests.add(TradeRequest(i, i));
          }

          Random random = Random();
          
          for(int i = 0; i < allRequests.length; i++){
            List<int> numbers = [];
            for(int i = 0; i < 10; i++){
              numbers.add(random.nextInt(100) + 1);
            }
            allRequests[i].offered = numbers;
          }

          for(int i = 0; i < allRequests.length; i++){
            List<int> numbers = [];
            for(int i = 0; i < 10; i++){
              numbers.add(random.nextInt(100) + 1);
            }
            allRequests[i].wanted = numbers;
          }

          for(int i = 0; i < allRequests.length; i++){
            Set<int> numbers = Set<int>();
            while(numbers.length < 10){
              numbers.add(random.nextInt(100) + 1);
            }
            allRequests[i].wanted = numbers.toList();
          }

          for(int i = 0; i < allRequests.length; i++){
            allRequests[i].offered.removeWhere((element) => allRequests[i].wanted.contains(element));
          }

          */

          bool isComplete = false;

          List<TradeToExecute> trades = [];

          int beginTradesToMake = 0;

          

          while(!isComplete){
            isComplete = true;
            Set<int> checked = Set<int>();
            for(int i = 0; i < allRequests.length - 1; i++){
              if(checked.contains(allRequests[i].idRaz)) continue;
              checked.add(allRequests[i].idRaz);
              int maxId = -1;
              int maxValue = 0;
              List<int> solutionList1 = [];
              List<int> solutionList2 = [];
              for(int j = i + 1; j < allRequests.length; j++){
                if(checked.contains(allRequests[j].idRaz)) continue;
                Set<int> firstElementOffered = allRequests[i].offered.toSet();
                Set<int> firstElementWanted = allRequests[i].wanted.toSet();
                Set<int> secondElementOffered = allRequests[j].offered.toSet();
                Set<int> secondElementWanted = allRequests[j].wanted.toSet();

                firstElementOffered.removeWhere((element) => !secondElementWanted.contains(element));
                secondElementOffered.removeWhere((element) => !firstElementWanted.contains(element));

                int max = firstElementOffered.length < secondElementOffered.length ? firstElementOffered.length : secondElementOffered.length;

                if(max > maxValue){
                  if(isComplete) isComplete = false;
                  maxValue = max;
                  maxId = j;
                  solutionList1 = firstElementOffered.toList();
                  solutionList1 = solutionList1.sublist(0, max);
                  solutionList2 = secondElementOffered.toList();
                  solutionList2 = solutionList2.sublist(0, max);
                }
              }

              if(maxId != -1){
                checked.add(allRequests[maxId].idRaz);
                trades.add(TradeToExecute(allRequests[i].idRaz, allRequests[maxId].idRaz, solutionList1, solutionList2, allRequests[i].idUser, allRequests[maxId].idUser, i, maxId));
              }

              
            }

            

            for(int i = beginTradesToMake; i < trades.length; i++){
                allRequests[trades[i].firstPlaceInTrade].offered = removeFirstOccurance(allRequests[trades[i].firstPlaceInTrade].offered, trades[i].firstToSecond);
                allRequests[trades[i].secondPlaceInTrade].wanted = removeFirstOccurance(allRequests[trades[i].secondPlaceInTrade].wanted, trades[i].firstToSecond);
                allRequests[trades[i].firstPlaceInTrade].wanted = removeFirstOccurance(allRequests[trades[i].firstPlaceInTrade].wanted, trades[i].secondToFirst);
                allRequests[trades[i].secondPlaceInTrade].offered = removeFirstOccurance(allRequests[trades[i].secondPlaceInTrade].offered, trades[i].secondToFirst);
              }

              beginTradesToMake = trades.length;
            
          }

          for(int i = 0; i < allRequests.length; i++){
            if(allRequests[i].offered.isEmpty || allRequests[i].wanted.isEmpty || allRequests[i].acceptDuplicates == 0) continue;
            for(int j = 0; j < allRequests.length; j++){
              if(i == j) continue;
              if(allRequests[j].offered.isEmpty || allRequests[j].acceptDuplicates == 0) continue;
              Set<int> firstElementWanted = allRequests[i].wanted.toSet();
              Set<int> secondElementOffered = allRequests[j].offered.toSet();
              secondElementOffered.removeWhere((element) => !firstElementWanted.contains(element));
              if(secondElementOffered.isEmpty) continue;
              List<int> solutionList1 = [];
              List<int> solutionList2 = [];
              int max = secondElementOffered.length < allRequests[i].offered.length ? secondElementOffered.length : allRequests[i].offered.length;
              solutionList1 = allRequests[i].offered;
              solutionList1 = solutionList1.sublist(0, max);
              solutionList2 = secondElementOffered.toList();
              solutionList2 = solutionList2.sublist(0, max);
              TradeToExecute newTrade = TradeToExecute(allRequests[i].idRaz, allRequests[j].idRaz, solutionList1, solutionList2, allRequests[i].idUser, allRequests[j].idUser, i, j);
              print(newTrade);
              trades.add(newTrade);
              print(trades[trades.length - 1]);
              allRequests[i].offered = removeFirstOccurance(allRequests[i].offered, solutionList1);
              allRequests[i].wanted = removeFirstOccurance(allRequests[i].wanted, solutionList2);
              allRequests[j].offered = removeFirstOccurance(allRequests[j].offered, solutionList2);
              for(int k = 0; k < solutionList2.length; k++){ 
                allRequests[j].offered.add(solutionList2[k]);
              }
              


            }
          }

        
          final headers = {
            'Content-Type': 'application/json; charset=UTF-8',
          };

          for(int i = 0; i < trades.length; i++){
            print(i);
            print(trades[i].toString());
          }

          
          

          
          
          for(int i = 0; i < trades.length; i++){
            for(int j = 0; j < trades[i].firstToSecond.length; j++){
              final response1 = await http.post(Uri.parse("http://localhost:3001/stickers/dohvatiSlicicuZaRazmenu"),
              headers: headers,
              body: jsonEncode({
                'idIgr': trades[i].firstToSecond[j],
                'idRaz': trades[i].firstId,
              }));
              final response1data = jsonDecode(response1.body);
              final List<dynamic> data1 = response1data['slicica'] ?? [];
              int idNez1 = data1[0]['idNez'];

        

              
              final response2 = await http.post(Uri.parse("http://localhost:3001/stickers/promeniVlasnikaSlicice"),
              headers: headers,
              body: jsonEncode({
                'idNez': idNez1,
                'idUser': trades[i].secondUser,
              }));

              final response3 = await http.post(Uri.parse("http://localhost:3001/stickers/obrisiSlicicuIzZamene"),
              headers: headers,
              body: jsonEncode({
                'idNez': idNez1,
              }));

              final response4 = await http.post(Uri.parse("http://localhost:3001/stickers/dohvatiSlicicuZaRazmenu"),
              headers: headers,
              body: jsonEncode({
                'idIgr': trades[i].secondToFirst[j],
                'idRaz': trades[i].secondId,
              }));
              final response4data = jsonDecode(response4.body);
              final List<dynamic> data4 = response4data['slicica'] ?? [];
              int idNez2 = data4[0]['idNez'];

              final response5 = await http.post(Uri.parse("http://localhost:3001/stickers/promeniVlasnikaSlicice"),
              headers: headers,
              body: jsonEncode({
                'idNez': idNez2,
                'idUser': trades[i].firstUser,
              }));

              final response6 = await http.post(Uri.parse("http://localhost:3001/stickers/obrisiSlicicuIzZamene"),
              headers: headers,
              body: jsonEncode({
                'idNez': idNez2,
              }));

              

              

            }
          }

          final response7 = await http.get(Uri.parse("http://localhost:3001/stickers/obrisiRazmene"));
          
          
        },
        child: Text('Execute Trade'),
      ),
    );
  }
} 