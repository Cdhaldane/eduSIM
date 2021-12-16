import React from "react";
import { useTranslation } from "react-i18next";

function Policy(props){
  const { t } = useTranslation();

  return (
    <div className="page-layout">
      <h1>Privacy Policy</h1>
      <p>
        By using this website, you hereby consent to this 
        Privacy Policy and agree to its terms. This Privacy Policy 
        applies only to the eduSIM website with
        regards to the information that it shares and/or collects.
        As eduSIM is still currently in development, the Privacy
        Policy is also subject to change over time.
      </p>
      <h3>Information Collected Directly from You</h3>
      <p>
        As a user of the eduSIM website, information you provide
        to eduSIM may include:
      </p>
      <ul>
        <li>Your name</li>
        <li>Your email address (eduSIM will not send any unsolicited promotional mail.)</li>
        <li>Any user content that you have submitted</li>
      </ul>
      <p>
        If you have invited another user to the eduSIM website via
        the "student/participant list" found in the administration
        panel, eduSIM also holds access to their information until
        it is otherwise deleted by you. This does not apply
        to collaborator invitations.
      </p>
      <p>
        eduSIM does not currently store passwords or any
        other similarly sensitive data.
      </p>
      <h3>Information Collected Automatically</h3>
      <p>
        eduSIM may receive some data automatically when you
        visit the eduSIM website. This includes information about
        your device, browser, and IP address. The eduSIM website
        in and of itself does not use this information to personally
        identify you. Some third-party software may use this data
        to protect the eduSIM website against malicious activity.
      </p>
      <h3>Cookies</h3>
      <p>
        eduSIM uses cookies to store session information and 
        remember who you are. eduSIM relies on third-party 
        software such as Auth0, which enables users to 
        log in using external accounts 
        and is known to use cookies in order
        to keep track of session data.
        To view more information about Auth0's privacy
        terms and compliance with GDPR, <a href="https://auth0.com/docs/compliance/gdpr">visit this page.</a>
      </p>
      <h3>Data Retention</h3>
      <p>
        We generally retain personal data associated with you for 
        as long as it may be relevant to the eduSIM platform.
        If you wish to remove and/or receive a copy of any personal 
        information that you believe is applicable to you, 
        please <a href="mailto:edusimuottawa@outlook.ca">contact us.</a>
      </p>
      <p>
        eduSIM does not knowingly collect any information that
        is able to personally identify anybody under the age
        of 13.
      </p>
    </div>
  );
}

export default Policy;
