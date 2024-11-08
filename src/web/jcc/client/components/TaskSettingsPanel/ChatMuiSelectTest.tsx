import React from "react";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";

interface SelectComponentProps {
    value: string;
    onChange: (value: string) => void;
}

const SelectComponent: React.FC<SelectComponentProps> = ({ value, onChange }) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value as string);
    };

    return (
        <FormControl fullWidth variant="outlined">
            <InputLabel id="select-label">Options</InputLabel>
            <Select labelId="select-label" value={value} onChange={handleChange} label="Options">
                <MenuItem value="option1">Option 1</MenuItem>
                <MenuItem value="option2">Option 2</MenuItem>
                <MenuItem value="option3">Option 3</MenuItem>
            </Select>
        </FormControl>
    );
};

export default SelectComponent;
