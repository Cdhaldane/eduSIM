import React,{ useState }from "react";
import Select, { components } from "react-select";

const MultiLevel = (props) => {
    const [selectValue, setSelectedValue] = useState("")
    
    const customStyles = {
        control: (base) => ({
        ...base,
        height: 60,
        padding:"0px",
        }),
        dropdownIndicator: base => ({
            ...base,
            margin: 0,
            paddingLeft: 0, paddingRight: 0
        }), 
        menuPortal: base => ({ ...base, zIndex: 9999, fontSize: '13px'}),
        valueContainer: base => ({ ...base, paddingLeft: 0, paddingRight: 0}),
        group: base => ({ ...base, paddingLeft: 0, paddingRight: 0}),
        groupHeading: base => ({ ...base, paddingLeft: 0, paddingRight: 0, fontSize: '15px', fontSize: 'bold'}),
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
        Object.keys(data).forEach(function (key) {
            if (Object.values(data[key]).flat().length > 2) {
                out = []
                {
                    Object.values(data[key]).flat().map((sub) => {
                        out.push({ value: Object.keys(data[key]) + sub, label: Object.keys(data[key]) + sub })
                    })
                }
                list.push({
                    label: Object.keys(data[key]),
                    options: out
                })
            } else {
                list.push({
                    value: Object.values(data[key]), label: Object.keys(data[key])
                })
            }

        })
        return (list)
    }

    const handleHeaderClick = id => {
        const node = document.querySelector(`#${id}`).parentElement
            .nextElementSibling;
        const classes = node.classList;
        if (classes.contains("collapsed")) {
            node.classList.remove("collapsed");
        } else {
            node.classList.add("collapsed");
        }
    };

    const CustomGroupHeading = props => {
        return (
            <div
                className="group-heading-wrapper"
                onClick={() => handleHeaderClick(props.id)}
            >
                <components.GroupHeading {...props} />
            </div>
        );
    };

    const handleChange = selectValue => {
        setSelectedValue(selectValue)
        props.handleChange(selectValue, props.x, props.y)
    }

    return(
        <div className="multi-container">
            <Select
                maxMenuHeight={1050}
                styles={customStyles}
                options={groupedOptions(props.data)}
                components={{ GroupHeading: CustomGroupHeading }}
                closeMenuOnSelect={true}
                menuPortalTarget={document.body}
                value={selectValue}
                onChange={handleChange}
            />
        </div>
    );
}

export default MultiLevel;