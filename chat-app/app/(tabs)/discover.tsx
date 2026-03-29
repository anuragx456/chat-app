import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import { useDiscoverUsers, useSendFriendRequest } from '@/hooks/useFriendQueries';
import { UserCard } from '@/components/UserCard';

const DiscoverScreen = () => {
    const [search, setSearch] = useState("");
    const {data:users=[], isLoading} = useDiscoverUsers(search);
    const sendRequestMutation = useSendFriendRequest();
    // const acceptRequestMutation = useAcceptFriendRequest();

    const handleSendRequest = async(receiverId: string) => {
        sendRequestMutation.mutate(receiverId)
    }

    return (
    <View style={styles.container}>
        <Text style={styles.header}>Discover People</Text>
        <TextInput 
        style={styles.searchInput}
        placeholder='Search by Email, Name...'
        placeholderTextColor={"#aaa"}
        value={search}
        onChangeText={setSearch}
        />

        {
            isLoading && !users.length ? (
                <ActivityIndicator size={"large"} color={"#007aff"} style={{ marginTop: 20}} />
            ) : (
                <FlatList 
                data={users}
                keyExtractor={(item) => item.id}
                renderItem={({item}) => (
                    <UserCard 
                    user={item}
                    onSendRequest={handleSendRequest}
                    onAcceptRequest={() => {}}
                    onRejectRequest={() => {}}
                    onCancelRequest={() => {}}
                    />
                )}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No Users Found.</Text>
                }
                contentContainerStyle={{paddingBottom: 20}}
                />
            )
        }
    </View>
    )
}

export default DiscoverScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#121212",
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 16,
        marginTop: 40,
    },
    searchInput: {
        backgroundColor: "#1e1e1e",
        color: "#fff",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#333",
    },
    emptyText: {
        color: "#aaa",
        textAlign: "center",
        marginTop: 20,
    },
})