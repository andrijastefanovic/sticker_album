import 'package:flutter/material.dart';
import 'books_page.dart';
import 'login_page.dart';
import 'register_page.dart';
import 'logout_page.dart';
import 'pack_page.dart';
import 'duplicates_page.dart';
import 'trade_page.dart';
import 'trade_execution.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: MainPage(),
    );
  }
}

class MainPage extends StatefulWidget {
  @override
  _MainPageState createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> with TickerProviderStateMixin {
  late TabController _tabController;

  bool isLoggedIn = false; 
  int userId = -1;
  String username = "";
  String lastOpen = DateTime.now().toString();
  int packsToOpen = -1;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: isLoggedIn ? 6 : 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void updatePacksToOpen(int packsToOpen){
    setState(() {
      this.packsToOpen = packsToOpen;
    });
  }

  void updateLoginStatus(bool status, int id, String name, String date, int packsToOpen) {
    setState(() {
      isLoggedIn = status;
      userId = id;
      username = name;
      lastOpen = date;
      this.packsToOpen = packsToOpen;
      _tabController = TabController(length: isLoggedIn ? 6 : 4, vsync: this);
    });
    _tabController.animateTo(0); 
  }

  void updateLastOpen(String newDate) {
    setState(() {
      lastOpen = newDate;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('FIBA World Cup 2023'),
        bottom: TabBar(
          controller: _tabController,
          tabs: [
            const Tab(text: 'Home'),
            if (isLoggedIn) const Tab(text: 'Album'), 
            if (isLoggedIn) const Tab(text: 'Pack'),
            if (isLoggedIn) const Tab(text: 'Duplicates'),
            if (!isLoggedIn) const Tab(text: 'Login'),
            if (!isLoggedIn) const Tab(text: 'Register'),
            if (isLoggedIn) const Tab(text: 'Trade'),
            if (isLoggedIn) const Tab(text: 'Logout'),
            if (!isLoggedIn) const Tab(text: 'Trade Execution')
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          HomeTab(),
          if (isLoggedIn)
            BooksTab(
              username: username,
              userId: userId,
              packsToOpen: packsToOpen,
              updatePacksToOpen: updatePacksToOpen,
            ), 
          if (isLoggedIn)
            PackTab(
              userId: userId,
              username: username,
              lastOpen: lastOpen,
              packsToOpen: packsToOpen,
              updateLastOpen: updateLastOpen,
              updatePacksToOpen: updatePacksToOpen,
            ),
          if (isLoggedIn)
            DuplicatesTab(userId: userId),
          if (!isLoggedIn) LoginTab(updateLoginStatus),
          if (!isLoggedIn) RegisterTab(),
          if (isLoggedIn) TradeTab(idUser: userId),
          if (isLoggedIn) LogoutTab(updateLoginStatus),
          if (!isLoggedIn) TradeExecutionTab(),
        ],
      ),
    );
  }
}

class HomeTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) { 
    return const Center(
      child: Text('FIBA World Cup 2023 Sticker Album',
      style: TextStyle(
        fontSize: 30
      ),
            ),
    );
  }
}
