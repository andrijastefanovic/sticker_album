import 'package:flutter/material.dart';

class LogoutTab extends StatefulWidget {
  final Function(bool, int, String, String, int) updateLoginStatus;

  LogoutTab(this.updateLoginStatus);

  @override
  _LogoutTabState createState() => _LogoutTabState();
}

class _LogoutTabState extends State<LogoutTab> {

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text('Logout Page'),
          SizedBox(height: 20),
          ElevatedButton(
            onPressed: () async {
              widget.updateLoginStatus(false, -1, "", DateTime.now().toString(), -1);
              setState(() {});
            },
            child: Text('Logout'),
          ),
        ],
      ),
    );
  }
}
