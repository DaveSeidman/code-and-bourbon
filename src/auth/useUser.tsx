import { useEffect, useState } from "react";
import type { User } from "./types";

export const useUser = () => {
    const [user, setUser] = useState<User | null>(null);

      useEffect(() => {
        if (user) {
            const stringifiedUser = JSON.stringify(user);
            localStorage.setItem('user', stringifiedUser);
        } else {
          localStorage.removeItem('user');
        }
      }, [user]);
    
      useEffect(() => {
        const userFromStorage = localStorage.getItem('user');
        if (userFromStorage) {
          const parsedUser = JSON.parse(userFromStorage) as User | null;
          if (parsedUser) {
            console.log('User found in storage', parsedUser);
            setUser(parsedUser);
          }
        }
      }, []);

      return { user, setUser };
}