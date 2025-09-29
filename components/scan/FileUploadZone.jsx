import React from 'react';
import { UploadIcon, Camera, Smartphone, FileText, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function FileUploadZone({ onFileSelect, onCameraCapture, dragActive }) {
  const [showCameraDialog, setShowCameraDialog] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const fileInputRef = React.useRef(null);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
  }, []);

  // הפונקציות הקשורות למצלמה הושארו אך לא מופעלות כדי למנוע קריסות
  // ניתן להחזיר אותן לאחר איתור הבעיה

  return (
    <>
      <div className={`transition-all duration-200 ${dragActive ? "bg-blue-50" : "bg-white"}`}>
        <div className="p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              <div
                className={`relative border-2 border-dashed rounded-2xl p-4 md:p-8 transition-all duration-300 hover:shadow-lg ${
                  dragActive 
                    ? "border-blue-400 bg-blue-50 shadow-lg" 
                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={onFileSelect}
                  className="hidden"
                />
                <div className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center elegant-shadow">
                    <FileText className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-gray-900">העלאת קבצים</h3>
                  <p className="text-gray-600 mb-4 md:mb-6 text-base md:text-lg">
                    גרור ושחרר את קבצי ההזמנות כאן
                  </p>
                  <Button
                    type="button"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 elegant-shadow text-base md:text-lg px-6 md:px-8 py-2 md:py-3 w-full md:w-auto"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadIcon className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                    בחר קבצים
                  </Button>
                  <p className="text-xs md:text-sm text-gray-500 mt-4 md:mt-6">
                    נתמך: PDF, PNG, JPEG
                  </p>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 md:p-8 hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-300 hover:shadow-lg">
                <div className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center elegant-shadow">
                    {isMobile ? (
                      <Smartphone className="w-8 h-8 md:w-10 md:h-10 text-purple-600" />
                    ) : (
                      <Camera className="w-8 h-8 md:w-10 md:h-10 text-purple-600" />
                    )}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-gray-900">
                    {isMobile ? 'מצלמת הטלפון' : 'מצלמת המחשב'}
                  </h3>
                  <p className="text-gray-600 mb-4 md:mb-6 text-base md:text-lg">
                    צלם תמונה של ההזמנה
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-purple-200 hover:bg-purple-50 hover:border-purple-300 text-base md:text-lg px-6 md:px-8 py-2 md:py-3 w-full md:w-auto"
                    onClick={() => alert("פונקציונליות המצלמה מושבתת זמנית לצורך איתור תקלות.")}
                  >
                    <ImageIcon className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                    {isMobile ? 'פתח מצלמה' : 'הפעל מצלמה'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}