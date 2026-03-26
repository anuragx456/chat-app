import { StyleSheet, Text, View, Pressable } from 'react-native'
import React from 'react'
import { Link } from 'expo-router';
import { authClient } from '@/utils/auth-client';
import { signOut } from 'better-auth/api';
import { useAuth } from '@/contexts/auth-context';

const HomeScreen = () => {

  const pingBackend = async () => {
    const res = await fetch("http://192.168.29.106:3000");
    const data = await res.text();
    console.log(data);
  }

  const {signOut} = useAuth()

  return (
    <View>
      <Pressable onPress={() => signOut()}>
        <Text> Sign Out</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  btn:{
    backgroundColor: "black",
    color: "white",
    borderRadius: 10,
    padding: 5
  }
})

export default HomeScreen
