import { useEffect } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setAllStatuses } from '../redux/statusSlice';
import { BASE_URL } from '..';

const useGetStatuses = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchStatuses = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/v1/status/all`, {
                    withCredentials: true
                });
                dispatch(setAllStatuses(res.data));
            } catch (error) {
                console.log("Error fetching statuses:", error);
            }
        };
        fetchStatuses();
    }, [dispatch]);
};

export default useGetStatuses;
