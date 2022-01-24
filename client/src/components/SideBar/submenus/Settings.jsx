
import React, { useContext } from "react";
import styled from "styled-components";
import Slider from 'rc-slider';
import { SettingsContext } from "../../../App";
import { useTranslation } from "react-i18next";

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: inherit;
  padding: 20px;
`;

const SettingRow = styled.div`
  display: flex;
  align-items: center;
  margin: 5px 0 10px;
  & > i {
    margin-right: 10px;
    color: var(--primary);
    min-width: 45px;
  }
  & > div b {
    font-size: .9em;
  }
  & > div p {
    font-size: .75em;
    opacity: 0.8;
  }
  & > input[type="checkbox"] {
    min-width: 26px;
    min-height: 26px;
    margin-left: 10px;
  }
`;

const Settings = (props) => {
  const { t } = useTranslation();

  const { updateSetting, settings } = useContext(SettingsContext);

  return (
    <SettingsContainer>
      <h2>{t("sidebar.settings")}</h2>
      <hr/>
      <SettingRow>
        <i className="settings-icons lni lni-eye"></i>
        <div>
          <b>{t("sidebar.highContrastMode")}</b>
          <p>{t("sidebar.highContrastModeExplanation")}</p>
        </div>
        <input
          type="checkbox"
          checked={settings.contrast || false}
          onChange={() => updateSetting('contrast', !settings.contrast)}
        />
      </SettingRow>
      <SettingRow>
        <i className="settings-icons lni lni-helicopter"></i>
        <div>
          <b>{t("sidebar.reduceMotion")}</b>
          <p>{t("sidebar.reduceMotionExplanation")}</p>
        </div>
        <input
          type="checkbox"
          checked={settings.notransition || false}
          onChange={() => updateSetting('notransition', !settings.notransition)}
        />
      </SettingRow>
      <SettingRow>
        <i className="settings-icons lni lni-text-format"></i>
        <div>
          <b>{t("sidebar.modifyTextSize")}</b>
          <p>{t("sidebar.modifyTextSizeExplanation")}</p>
        </div>
      </SettingRow>
      <Slider
        className="slider"
        value={settings.textsize || 1}
        onChange={(val) => updateSetting('textsize', val)}
        min={1}
        max={1.4}
        step={0.1}
        handleStyle={{
          backgroundColor: "var(--primary)",
          border: 0,
        }}
        trackStyle={{
          background: "var(--primary)"
        }}
      />
    </SettingsContainer>
  );
}

export default Settings;
