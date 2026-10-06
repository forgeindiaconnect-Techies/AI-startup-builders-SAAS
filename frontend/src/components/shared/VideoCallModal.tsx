import React from 'react';
import { X, Maximize2 } from 'lucide-react';

interface VideoCallModalProps {
  roomName: string;
  onClose: () => void;
}

const VideoCallModal: React.FC<VideoCallModalProps> = ({ roomName, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8 animate-fade-in">
      <div className="bg-gray-900 w-full max-w-6xl h-full max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-800 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-950 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <h2 className="text-white font-bold text-lg">Secure Video Call (End-to-End Encrypted)</h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800">
              <Maximize2 size={18} />
            </button>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-gray-800 flex items-center gap-2"
            >
              <X size={20} /> <span className="font-bold text-sm pr-1">Leave Call</span>
            </button>
          </div>
        </div>
        
        {/* Video Area */}
        <div className="flex-1 w-full bg-black relative">
          <iframe 
            src={`https://meet.jit.si/${roomName}`} 
            allow="camera; microphone; fullscreen; display-capture"
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;
