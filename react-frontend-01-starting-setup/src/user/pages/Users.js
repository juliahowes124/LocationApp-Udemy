import React from 'react';

import UsersList from '../components/UsersList';

const Users = () => {
    const USERS = [
        {
            id: 'u1',
            name: 'Julia Howes',
            image: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg',
            places: 3
        }
    ];

    return <UsersList items={USERS} />
};

export default Users;