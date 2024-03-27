import React, { useEffect, useRef } from "react";

function ImageUpload({ onSetImage }) {
    const widgetRef = useRef(null);

    useEffect(() => {
        if (!window.cloudinary) return;

        widgetRef.current = window.cloudinary.createUploadWidget({
            cloudName: 'di4vwvyre',
            uploadPreset: 'avatar',
            sources: ["local", "url"],
            multiple: false,
        }, (error, result) => {
            if (!error && result && result.event === "success") {
                console.log("Upload Successful:", result.info);
                onSetImage(result.info.secure_url);
            }
        });
    }, [onSetImage]);

    const showWidget = () => {
        if (widgetRef.current) {
            widgetRef.current.open();
        }
    };

    return (
        <div>
            <button onClick={showWidget} type="button">Upload Image</button>
        </div>
    );
}

export default ImageUpload;
