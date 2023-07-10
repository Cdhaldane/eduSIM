import React, { useState, useEffect } from 'react';
// import AuthenticationButton from '../Auth0/AuthenticationButton';
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import User from "../../../public/icons/user-alt-4.svg"
import Exit from "../../../public/icons/exit.svg"


import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

import { supabase } from '../Supabase.js'

const ProfileDropdown = (props) => {
    const { t, i18n } = useTranslation();

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut()
        window.location.href = window.location.origin;
        localStorage.clear();
        props.close()
    };

    const [session, setSession] = useState(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        })

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => subscription.unsubscribe()
    }, [])

    return (
        <>
            {props.open && (
                <div className={"profile-dropdown " + props.className}>
                    {/* <h2>{props.user.name}</h2> */}
                    <div className="profilevist-container">
                        {props.profile &&
                            <Link
                                onClick={() => { props.close() }}
                                to={`/profile/${localStorage.adminid}`}
                                className="profile-dropdown-link"
                                type="button">
                                <User />
                                {t("navbar.profile")}
                            </Link>
                        }
                        {!session ?
                            <div className="profile-dropdown-auth">
                                <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} theme="dark" providers={['google', 'azure']} />
                            </div>
                            :
                            <a className="profile-dropdown-link" onClick={handleLogout}> <Exit /> Log out</a>
                        }
                    </div>
                </div>
            )}
        </>

    );
};

export default ProfileDropdown;
