import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class LoginTab extends StatefulWidget {
  final Function(bool, int, String, String, int) updateLoginStatus;

  LoginTab(this.updateLoginStatus);

  @override
  _LoginTabState createState() => _LoginTabState();
}

class _LoginTabState extends State<LoginTab> {
  TextEditingController usernameController = TextEditingController();
  TextEditingController passwordController = TextEditingController();
  String errorMessage = "";

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0),
            child: Column(
              children: [
                TextFormField(
                  controller: usernameController,
                  decoration: InputDecoration(labelText: 'Username'),
                ),
                SizedBox(height: 10),
                TextFormField(
                  controller: passwordController,
                  obscureText: true,
                  decoration: InputDecoration(labelText: 'Password'),
                ),
              ],
            ),
          ),
          SizedBox(height: 20),
          ElevatedButton(
            onPressed: () async {
              final username = usernameController.text;
              final password = passwordController.text;

              final headers = {
                'Content-Type': 'application/json; charset=UTF-8',
              };

              final response = await http.post(
                Uri.parse('http://localhost:3001/users/login'),
                headers: headers,
                body: jsonEncode({
                  'username': username,
                  'password': password,
                }),
              );

              final Map<String, dynamic> responseBody = json.decode(response.body);

              if (responseBody['success'] == true) {
                widget.updateLoginStatus(true, responseBody['user']['idUser'], responseBody['user']['username'], responseBody['user']['datumPoslednjegOtvaranja'], responseBody['user']['packsToOpen']);
                errorMessage = "";
              } else {
                errorMessage = "Login failed. Please check your credentials.";
              }
              setState(() {});
            },
            child: Text('Login'),
          ),
          if (errorMessage.isNotEmpty)
            Text(
              errorMessage,
              style: TextStyle(color: Colors.red),
            ),
        ],
      ),
    );
  }
}
