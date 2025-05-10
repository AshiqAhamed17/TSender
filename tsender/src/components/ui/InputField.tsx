import React from "react";

type InputFieldProps = {
    label: string;
    placeholder?: string;
    value: string;
    type?: string;
    large?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

export default function InputField({
    label,
    placeholder,
    value,
    type = "text",
    large = false,
    onChange,
}: InputFieldProps) {
    return (
        <div className="flex flex-col gap-2 text-white w-full">
            <label className="text-sm font-medium text-cyan-300 tracking-wide">{label}</label>

            {large ? (
                <textarea
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    rows={5}
                    className="bg-[#111111]/80 text-white px-4 py-3 rounded-xl border border-cyan-900 focus:border-cyan-400 focus:outline-none resize-none transition-all shadow-md backdrop-blur-md"
                />
            ) : (
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="bg-[#111111]/80 text-white px-4 py-3 rounded-xl border border-cyan-900 focus:border-cyan-400 focus:outline-none transition-all shadow-md backdrop-blur-md"
                />
            )}
        </div>
    );
}