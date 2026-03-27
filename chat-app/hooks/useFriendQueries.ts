import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { friendService } from "@/services/friend.services";

export const USER_KEYS = {
    all: ["users"] as const,
    discover: (search:string) => [...USER_KEYS.all, "discover", search] as const,
    friends: () => [...USER_KEYS.all, "friends"] as const,
}

export function useDiscoverUsers(search: string) {
    return useQuery({
        queryKey: USER_KEYS.discover(search),
        queryFn: () => friendService.discoverUsers(search),
        staleTime: 1000 * 60 * 5
    })
}

export function useSendFriendRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (receiverId: string) => friendService.sendFriendRequest(receiverId),
        onMutate: async(receierId) => {
            await queryClient.cancelQueries({ queryKey: USER_KEYS.all });
            const previousUsers = queryClient.getQueryData<any[]>(USER_KEYS.discover(""));

            if(previousUsers){
                queryClient.setQueriesData({queryKey: USER_KEYS.all}, (old: any[]) => {
                    if(!old) return [];
                    return old.map((user) => 
                        user.id === receierId ? { ...user, relationship: "REQUEST_SENT" } : user
                    );
                }) 
            }

            return { previousUsers }
        },
        onError: (err, newTodo, context) => {
            // Rollback on error
            if (context?.previousUsers) {
                queryClient.setQueriesData({ queryKey: USER_KEYS.all }, context.previousUsers);
            }
        },
        onSettled: () => {
            // Invalidate to refresh fresh data
            queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
        },
    })
}

export function useFriends() {
    return useQuery({
        queryKey: USER_KEYS.friends(),
        queryFn: () => friendService.getFriends(),
        staleTime: 1000 * 6 * 5, // 5 minutes
    })
}