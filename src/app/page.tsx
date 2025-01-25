"use client";

import { OutputFileType } from "@/types/outputFileType";
import {
  Button,
  Dropdown,
  FileInput,
  Label,
  RangeSlider,
} from "flowbite-react";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fileHovering, setFileHovering] = useState(false);

  const [compressedFile, setCompressedFile] = useState<File | null>(null);

  const [outputFileType, setOutputFileType] = useState(OutputFileType.JPEG);

  const [quality, setQuality] = useState(80);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    const supportedTypes = [".svg", ".png", ".jpg", ".jpeg", ".webp"];
    if (files && files.length > 0) {
      if (files[0].size > 10 * 1024 * 1024) {
        alert("File too large, must be less than 10 MB!");
        return;
      }
      if (
        supportedTypes.some((type) =>
          files[0].name.toLowerCase().endsWith(type),
        )
      ) {
        setFile(files[0]);
      } else {
        alert("Unsupported file type!");
      }
    }
  };

  const handleFileDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setFileHovering(true);
  };

  const handleFileDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setFileHovering(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer.files;
    const supportedTypes = [".svg", ".png", ".jpg", ".jpeg", ".webp"];
    if (files && files.length > 0) {
      if (files[0].size > 10 * 1024 * 1024) {
        alert("File too large, must be less than 10 MB!");
        return;
      }
      if (
        supportedTypes.some((type) =>
          files[0].name.toLowerCase().endsWith(type),
        )
      ) {
        setFile(files[0]);
      } else {
        alert("Unsupported file type!");
      }
    }
  };

  const parseFileSize = (size: number) => {
    if (size < 1024) {
      return size + " bytes";
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(2) + " KB";
    } else if (size < 1024 * 1024 * 1024) {
      return (size / 1024 / 1024).toFixed(2) + " MB";
    } else {
      return (size / 1024 / 1024 / 1024).toFixed(2) + " GB";
    }
  };

  const compressImage = async () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (!event?.target?.result) {
          alert("Failed to compress image!");
          return;
        }
        const imageString = (event.target.result as string).split(",")[1];
        try {
          const response = await fetch("/api/compress", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              image: imageString,
              quality,
              outputFileType,
            }),
          });
          if (response.ok) {
            const data = await response.json();

            let mimeType = "image/jpeg";
            let extension = ".jpeg";

            switch (outputFileType) {
              case OutputFileType.PNG:
                mimeType = "image/png";
                extension = ".png";
                break;
              case OutputFileType.WEBP:
                mimeType = "image/webp";
                extension = ".webp";
                break;
              case OutputFileType.JPEG:
              default:
                mimeType = "image/jpeg";
                extension = ".jpeg";
                break;
            }

            const compressedImage = Buffer.from(data.compressedImage, "base64");
            const blob = new Blob([compressedImage], { type: mimeType });
            const newFileName = file.name.replace(/\.[^/.]+$/, extension);
            const compressedFile = new File([blob], newFileName, {
              type: mimeType,
            });
            setCompressedFile(compressedFile);
          } else {
            alert("Failed to compress image!");
          }
        } catch {
          alert("Failed to compress image!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const outputFileTypeToString = (outputFileType: OutputFileType) => {
    switch (outputFileType) {
      case OutputFileType.JPEG:
        return ".jpeg (Recommended)";
      case OutputFileType.PNG:
        return ".png";
      case OutputFileType.WEBP:
        return ".webp";
    }
  };

  const handleQualitySliderChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setQuality(parseInt(event.target.value));
  };

  const downloadCompressedFile = () => {
    if (compressedFile) {
      const url = URL.createObjectURL(compressedFile);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", compressedFile.name);
      document.body.appendChild(link);
      link.click();
    }
  };

  const reset = () => {
    setFile(null);
    setCompressedFile(null);
    setOutputFileType(OutputFileType.JPEG);
    setQuality(80);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col items-center">
        <h1 className="text-center text-4xl font-bold">Shrinky</h1>
        <h2 className="text-center text-xl mt-2 mb-5">
          Compress and convert your images with ease
        </h2>
        {!file && (
          <div className="flex w-full items-center justify-center">
            <Label
              htmlFor="dropzone-file"
              className={
                !fileHovering
                  ? "flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                  : "flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-600"
              }
              onDragOver={handleFileDragOver}
              onDragLeave={handleFileDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center pb-6 pt-5">
                <svg
                  className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  SVG, PNG, JPEG or WEBP. 10MB file size limit
                </p>
              </div>
              <FileInput
                id="dropzone-file"
                className="hidden"
                accept=".svg,.png,.jpg,.jpeg,.webp"
                onChange={handleFileChange}
              />
            </Label>
          </div>
        )}
        {file && (
          <div className="flex flex-row gap-4 w-full">
            <div className="flex flex-col items-center w-full">
              <Image
                src={URL.createObjectURL(file)}
                alt="Uploaded image"
                className="w-full rounded-lg"
              />
              <div className="flex flex-col items-center justify-center mt-5">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  File name: {file.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  File size: {parseFileSize(file.size)}
                </p>
              </div>
            </div>
            {compressedFile && (
              <div className="flex flex-col items-center w-full">
                <h1 className="text-center text-2xl font-bold mb-10">
                  Compressed
                </h1>
                <Image
                  src={URL.createObjectURL(file)}
                  alt="Compressed image"
                  className="w-full rounded-lg"
                />
                <div className="flex flex-col items-center justify-center mt-5">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    File name: {compressedFile.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    File size: {parseFileSize(compressedFile.size)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="mt-7" />
      {!compressedFile && (
        <div>
          <label htmlFor="outputFileTypeDropdown" className="text-md font-bold">
            Output file type (An output file type different to the input file
            can increase file sizes):
          </label>
          <Dropdown
            id="outputFileTypeDropdown"
            label={outputFileTypeToString(outputFileType)}
          >
            <Dropdown.Item
              onClick={() => setOutputFileType(OutputFileType.JPEG)}
            >
              .jpeg (Recommended)
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => setOutputFileType(OutputFileType.PNG)}
            >
              .png
            </Dropdown.Item>
            <Dropdown.Item
              onClick={() => setOutputFileType(OutputFileType.WEBP)}
            >
              .webp
            </Dropdown.Item>
          </Dropdown>
          {outputFileType !== OutputFileType.PNG && (
            <div className="mt-4">
              <label htmlFor="qualitySlider" className="text-md font-bold">
                Quality:
              </label>
              <div className="flex flex-row items-center w-full">
                <RangeSlider
                  id="qualitySlider"
                  onChange={handleQualitySliderChange}
                  min={1}
                  max={100}
                  step={1}
                  defaultValue={quality}
                  className="w-full"
                />
                <p className="ml-2">{quality}%</p>
              </div>
            </div>
          )}
        </div>
      )}
      {file && !compressedFile && (
        <Button color="blue" onClick={compressImage} className="mt-4">
          Compress!
        </Button>
      )}
      {compressedFile && (
        <div className="flex flex-row items-center mt-4">
          <Button color="success" onClick={downloadCompressedFile}>
            Download
          </Button>
          <div className="w-4" />
          <Button color="blue" onClick={reset}>
            Upload another image
          </Button>
        </div>
      )}
    </div>
  );
}
