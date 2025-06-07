import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { supabase } from './supabaseClient';
import Icon from 'react-native-vector-icons/MaterialIcons';

type Clubs = {
    ClubID: string,
    ClubName: String
  }

export const searchClubsByClubName = async (query: string, setData: Dispatch<SetStateAction<Clubs[]>>) => {
    if (query.trim()) {
      const { data: clubs, error } = await supabase
        .from('clubs')
        .select('ClubID::text, ClubName')
        .ilike('ClubName', `%${query}%`)

      if (error) {
        console.error('Error fetching data:', error)
        setData([])
      } else {
        setData(clubs)
      }
    }
  };
