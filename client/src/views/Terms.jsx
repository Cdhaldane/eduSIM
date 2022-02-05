import React from "react";
import { useTranslation } from "react-i18next";

function Terms(props){
  const { t } = useTranslation();

  return (
    <div className="page-layout">
      <div className="privacy-container">
      <h1>Terms of Service</h1>
      <h3>Consent</h3>
      <p>
        By accessing the eduSIM website, you are agreeing to be bound by these
        Terms of Service, all applicable laws and regulations, and agree
        that you are responsible for compliance with any applicable local laws. If
        you do not agree with any of these terms, you are prohibited from using or
        accessing the eduSIM website.
      </p>
      <p>
        You must be at least 13 years of age in order to access the eduSIM website. By using
        the eduSIM website and by agreeing to these terms, you agree that
        you are of at least 13 years of age.
      </p>
      <p>
        eduSIM holds the right to revise these terms of use at any time without
        notice. By using the eduSIM website you are agreeing to be bound by the then current
        version of these Terms of Service.
      </p>
      <h3>Disclaimer</h3>
      <p>
        The materials on the eduSIM website are provided "as is". eduSIM makes no
        warranties, expressed or implied, and hereby disclaims and negates all other
        warranties, including without limitation, implied warranties or conditions of
        merchantability, fitness for a particular purpose, or non-infringement of intellectual
        property or other violation of rights.
      </p>
      <p>
        eduSIM does not make any representations concerning the accuracy or reliability
        of the use of the materials on the eduSIM website or otherwise relating to such
        materials or any sites linked to the eduSIM website.
      </p>
      <p>
        eduSIM will not be held accountable for any damages that will arise with the use
        or inability to use the materials on the eduSIM website, regardless of whether
        eduSIM has been notified, orally or written, of the possibility of such damage.
      </p>
      <h3>User Content</h3>
      <p>
        User content refers to any materials including but not limited to text, images,
        audio, and video that is submitted or shared by a user to the eduSIM
        website. eduSIM does not claim ownership
        over any user content submitted to the site. Any submitted user content must not
        be illegal in nature and must not give rise to legal action whether against you,
        eduSIM, or a third party (under any applicable law). eduSIM reserves the right
        to remove any user content at our discretion.
      </p>
      <p>
        eduSIM does not undertake to comprehensively monitor the submission of user content
        to this website, nor do we take responsibility for content that is submitted to
        this website or what effects it may have on you.
      </p>
      <p>
        By using, uploading, or sharing user content with eduSIM, you grant eduSIM a perpetual,
        nonexclusive, transferable, royalty-free, sublicensable, and worldwide license to use,
        host, reproduce, modify, adapt, publish, translate, create derivative works from,
        distribute, perform, and display the user content for the sole purpose of making the
        user content available on the eduSIM website.
      </p>
      <h3>User Accounts</h3>
      <p>
        In order to use parts of the eduSIM website, you will be required to log in
        via a selection of third-party services. eduSIM will not be held accountable for
        damages or loss of access to any external accounts used to log into the eduSIM website.
      </p>
      <p>
        eduSIM holds the right to disable your access to the eduSIM website at our discretion
        without notice or explanation and regardless of your conduct or submitted user content.
      </p>
      </div>
    </div>
  );
}

export default Terms;
