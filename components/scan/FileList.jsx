import React from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText, ImageIcon, X, Check, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function FileList({ files, processing, progress, removeFile }) {
  return (
    <div className="space-y-4">
      {files.map((file, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`flex items-center justify-between p-6 rounded-xl border transition-all duration-200 ${
            processing[index] 
              ? "border-blue-500 bg-blue-50 shadow-md" 
              : "border-gray-200 bg-white hover:shadow-md"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center elegant-shadow">
              {file.type === "application/pdf" ? (
                <div className="bg-red-100 w-full h-full rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-red-600" />
                </div>
              ) : (
                <div className="bg-blue-100 w-full h-full rounded-xl flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-blue-600" />
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">{file.name}</p>
              <p className="text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {processing[index] ? (
              <div className="w-40">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium text-blue-700">מעבד...</span>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                </div>
                <Progress value={progress[index]} className="h-2" />
              </div>
            ) : progress[index] === 100 ? (
              <Badge className="bg-green-100 text-green-800 border-green-200 px-4 py-2">
                <Check className="w-4 h-4 ml-1" /> הושלם
              </Badge>
            ) : null}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeFile(index)}
              className="hover:bg-red-50 hover:text-red-600 rounded-xl"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}