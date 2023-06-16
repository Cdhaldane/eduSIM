import React, { useState } from 'react';
import AuthenticationButton from '../Auth0/AuthenticationButton';
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import User from "../../../public/icons/user-alt-4.svg"
import Exit from "../../../public/icons/exit.svg"

const ProfileDropdown = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const { t, i18n } = useTranslation();

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = () => {
        // Add your logout logic here
        console.log('Logged out');
    };

    return (
        <>
            {props.open && (
                <div className="profile-dropdown">
                    {/* <h2>{props.user.name}</h2> */}
                    <div className="profilevist-container">
                        <span>
                            <User />
                            <Link
                                onClick={() => {props.close()}}
                                to={`/profile/${localStorage.adminid}`}
                                className="profile-dropdown-link"
                                type="button">
                                {t("navbar.profile")}
                            </Link>
                        </span>
                        <span>
                            <Exit />
                            <AuthenticationButton onClick={() => {props.close()}} className="profile-dropdown-link" />
                        </span>

                    </div>
                </div>
            )}
        </>

    );
};

export default ProfileDropdown;
