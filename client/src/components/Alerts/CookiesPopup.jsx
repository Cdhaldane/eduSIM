import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "./Cookies.css";

const CookiesPopup = (props) => {
  const { t } = useTranslation();
  const [moreInfo, setMoreInfo] = useState(false);

  return (
    <div className="cookiesContainer">
      <table className="cookiesInner">
        <tbody>
          <tr>
            <td className="cookiesInfo">
              <b>{t("home.cookieNotice")}</b> {t("home.cookieOverview")}
              <div>
                {moreInfo && (
                  <>
                    {t("home.cookieDetails")}
                  </>
                )}
                {!moreInfo && (
                  <>
                    <a onClick={() => setMoreInfo(true)}>{t("home.cookieLearnMore")}</a>
                  </>
                )}
              </div>
            </td>
            <td>
              <button onClick={props.close}>{t("home.cookieOK")}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default CookiesPopup;
