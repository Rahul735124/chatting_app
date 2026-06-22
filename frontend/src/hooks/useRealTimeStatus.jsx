import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addMyStatus, deleteMyStatus, updateStatusViewers } from "../redux/statusSlice";

const useRealTimeStatus = () => {
    const { socket } = useSelector(store => store.socket);
    const dispatch = useDispatch();

    useEffect(() => {
        socket?.on("newStatus", (newStatusGroup) => {
            dispatch(addMyStatus(newStatusGroup));
        });

        socket?.on("statusDeleted", (statusId) => {
            dispatch(deleteMyStatus(statusId));
        });

        socket?.on("statusViewed", ({ statusId, viewers }) => {
            dispatch(updateStatusViewers({ statusId, viewers }));
        });

        return () => {
            socket?.off("newStatus");
            socket?.off("statusDeleted");
            socket?.off("statusViewed");
        }
    }, [socket, dispatch]);
};

export default useRealTimeStatus;
