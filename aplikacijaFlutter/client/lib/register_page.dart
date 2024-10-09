import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class RegisterTab extends StatefulWidget {

  @override
  _RegisterTabState createState() => _RegisterTabState();
}

class _RegisterTabState extends State<RegisterTab> {
  TextEditingController usernameController = TextEditingController();
  TextEditingController passwordController = TextEditingController();
  TextEditingController confirmPasswordController = TextEditingController();
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
                SizedBox(height: 10),
                TextFormField(
                  controller: confirmPasswordController,
                  obscureText: true,
                  decoration: InputDecoration(labelText: 'Confirm Password'),
                ),
              ],
            ),
          ),
          SizedBox(height: 20),
          ElevatedButton(
            onPressed: () async {
              final username = usernameController.text;
              final password = passwordController.text;
              final confirmPassword = confirmPasswordController.text;

              if (password != confirmPassword) {
                errorMessage = "Passwords do not match.";
              } else {
                final response = await http.post(
                  Uri.parse('http://localhost:3001/users/register'),
                  body: {
                    'username': username,
                    'password': password,
                  },
                );

                if (response.statusCode == 200) {
                  errorMessage = "";
                } else {
                  errorMessage = "Registration failed. Please try again.";
                }
              }
              setState(() {});
            },
            child: Text('Register'),
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
