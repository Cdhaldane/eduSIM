import React, { useState } from "react";
import Select, { components } from "react-select";

const MultiLevel = (props) => {
    const [selectValue, setSelectedValue] = useState("")
    const [collapsedGroups, setCollapsedGroups] = useState({});

    const customStyles = {
        control: (base) => ({
            ...base,
            height: 60,
            padding: "0px",
        }),
        dropdownIndicator: base => ({
            ...base,
            margin: 0,
            paddingLeft: 0, paddingRight: 0
        }),
        menu: (base) => ({
            ...base,
            width: "auto",
        }),
        menuPortal: base => ({ ...base, zIndex: 9999, fontSize: '13px' }),
        valueContainer: base => ({ ...base, paddingLeft: 0, paddingRight: 0 }),
        group: base => ({ ...base, paddingLeft: 0, paddingRight: 0 }),
        groupHeading: base => ({ ...base, paddingLeft: 0, paddingRight: 0, fontSize: '15px', fontSize: 'bold' }),
        menuList: (base) => ({
            ...base,

            "::-webkit-scrollbar": {
                width: "4px",
                height: "0px",
            },
            "::-webkit-scrollbar-track": {
                background: "#f1f1f1"
            },
            "::-webkit-scrollbar-thumb": {
                background: "#888"
            },
            "::-webkit-scrollbar-thumb:hover": {
                background: "#555"
            }
        }),

        padding: 0,
        marging: 0
    };

    const groupedOptions = (data) => {
        let list = []
        let out = []
        Object.keys(data).forEach(function (key, index) {
            if (Object.values(data[key]).flat().length > 2) {
                out = []
                {
                    Object.values(data[key]).flat().map((sub) => {
                        out.push({ value: Object.keys(data[key]) + sub, label: Object.keys(data[key]) + "_" + sub, groupId: `group-${index}` })
                    })
                }
                list.push({
                    label: Object.keys(data[key]),
                    options: out,
                    id: `group-${index}`
                })
            } else {
                list.push({
                    value: Object.values(data[key]), label: Object.keys(data[key]), groupId: `group-${index}`
                })
            }
        })
        return (list)
    }

    const handleHeaderClick = (id) => {
        setCollapsedGroups((prevState) => {
            return { ...prevState, [id]: !prevState[id] };
        });
    };

    const filteredOptions = () => {
        const options = groupedOptions(props.data);
        return options.map((option) => {
            if (option.options) {
                return {
                    ...option,
                    options: collapsedGroups[option.id]
                        ? []
                        : option.options,
                };
            } else {
                return option;
            }
        });
    };

    const CustomGroupHeading = (props) => {
        const toggleCollapse = () => {
            handleHeaderClick(props.id);
        };

        return (
            <div
                className={`group-heading-wrapper ${collapsedGroups[props.id] ? "collapsed" : ""
                    }`}
                onClick={toggleCollapse}
            >
                <components.GroupHeading {...props} />
                <span className="indicator">
                    {collapsedGroups[props.id] ? "+" : "-"}
                </span>
            </div>
        );
    };

    const CustomOption = (props) => {
        return <components.Option {...props} />;
    };

    const handleChange = (selectValue) => {
        setSelectedValue(selectValue);
        props.handleChange(selectValue, props.x, props.y);
    };

    return (
        <div className="multi-container">
            <Select
                maxMenuHeight={1050}
                styles={customStyles}
                options={filteredOptions()}
                components={{
                    GroupHeading: CustomGroupHeading,
                    Option: CustomOption,
                }}
                closeMenuOnSelect={true}
                menuPortalTarget={document.body}
                value={selectValue}
                onChange={handleChange}
            />
        </div>
    );
};

export default MultiLevel;