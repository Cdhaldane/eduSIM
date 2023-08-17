import React, { useState, useEffect } from 'react';

import './Error.css';

const ErrorWrapper = ({ children }) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const errorHandler = (error) => {
            // Log the error or handle it as needed
            console.log('error', error)
            setHasError(true);
        };

        window.addEventListener('error', errorHandler);
        return () => {
            window.removeEventListener('error', errorHandler);
        };
    }, []);

    if (hasError) {
        return (
            <div id='oopss'>
                <div id='error-text'>
                    <img src="https://cdn.rawgit.com/ahmedhosna95/upload/1731955f/sad404.svg" alt="404" />
                    <span>404 PAGE</span>
                    <p class="p-a">
                        .The page you were looking for could not be found</p>
                    <a onClick={() => window.location.reload()} class="back">... Refresh</a>
                </div>
            </div>
        )
    }

    return children;
};

export default ErrorWrapper;
