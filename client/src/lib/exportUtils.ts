import { FlowState, CanvasItem, Connection, calculateConnectionPath } from './flowCreator';
import GIF from 'gif.js';
import html2canvas from 'html2canvas';

interface ExportOptions {
  filename: string;
  quality: 'low' | 'medium' | 'high';
  speed: number;
  width: number;
  height: number;
}

const defaultOptions: ExportOptions = {
  filename: 'flow-animation',
  quality: 'medium',
  speed: 3,
  width: 800,
  height: 600
};

// Create a single frame for gif or video
const createFrame = async (canvasElement: HTMLElement): Promise<HTMLCanvasElement> => {
  return await html2canvas(canvasElement, {
    backgroundColor: null,
    scale: window.devicePixelRatio,
    allowTaint: true,
    useCORS: true
  });
};

// Animate connections by adding and removing animation classes
const animateConnections = (
  connections: HTMLElement[], 
  duration: number, 
  callback: () => void
) => {
  connections.forEach(conn => {
    conn.classList.add('animate-connection');
  });
  
  setTimeout(() => {
    connections.forEach(conn => {
      conn.classList.remove('animate-connection');
    });
    callback();
  }, duration);
};

// Export to GIF
export const exportToGIF = async (
  canvasElement: HTMLElement, 
  flowState: FlowState,
  options: Partial<ExportOptions> = {}
): Promise<void> => {
  const mergedOptions = { ...defaultOptions, ...options };
  const { width, height, quality, speed, filename } = mergedOptions;
  
  // Quality settings
  const qualitySettings = {
    low: { workers: 2, quality: 5, workerScript: 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js' },
    medium: { workers: 4, quality: 10, workerScript: 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js' },
    high: { workers: 8, quality: 20, workerScript: 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js' }
  };
  
  const frameDelay = 100 * (6 - speed); // Inverse relationship: faster speed = lower delay
  const gif = new GIF({
    ...qualitySettings[quality],
    width,
    height,
    repeat: 0,
    background: '#FFFFFF',
    transparent: 'rgba(0,0,0,0)'
  });
  
  // Setup promise to handle when GIF is done rendering
  const gifPromise = new Promise<Blob>((resolve) => {
    gif.on('finished', (blob) => {
      resolve(blob);
    });
  });
  
  try {
    // Capture initial frame
    const initialFrame = await createFrame(canvasElement);
    gif.addFrame(initialFrame, { delay: frameDelay * 2 });
    
    // Find connection elements and animate them one by one
    const connectionElements = Array.from(canvasElement.querySelectorAll('.connection-path'));
    for (let i = 0; i < connectionElements.length; i++) {
      // Set current connection to animated
      const currentConnection = connectionElements[i] as HTMLElement;
      currentConnection.classList.add('animate-connection');
      
      // Capture frame with this connection animated
      const animatedFrame = await createFrame(canvasElement);
      gif.addFrame(animatedFrame, { delay: frameDelay * 3 });
      
      // Reset animation for next frame
      currentConnection.classList.remove('animate-connection');
    }
    
    // Add final frame with all connections animated
    connectionElements.forEach(conn => {
      (conn as HTMLElement).classList.add('animate-connection');
    });
    
    const finalFrame = await createFrame(canvasElement);
    gif.addFrame(finalFrame, { delay: frameDelay * 4 });
    
    // Render the GIF
    gif.render();
    
    // Wait for GIF to be rendered
    const blob = await gifPromise;
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.gif`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Error exporting to GIF:', error);
    throw new Error('Failed to export as GIF');
  }
};

// Export to Video (MP4)
export const exportToVideo = async (
  canvasElement: HTMLElement, 
  flowState: FlowState,
  options: Partial<ExportOptions> = {}
): Promise<void> => {
  const mergedOptions = { ...defaultOptions, ...options };
  const { width, height, quality, speed, filename } = mergedOptions;
  
  try {
    // Capture the canvas as a snapshot first
    const canvas = await createFrame(canvasElement);
    const stream = canvas.captureStream(30); // 30 FPS
    
    // Check MediaRecorder support
    if (!window.MediaRecorder) {
      throw new Error('MediaRecorder not supported in this browser');
    }
    
    // Quality settings
    const videoQuality = {
      low: 1000000,    // 1 Mbps
      medium: 2500000, // 2.5 Mbps
      high: 5000000    // 5 Mbps
    };
    
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm',
      videoBitsPerSecond: videoQuality[quality]
    });
    
    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
    
    // Start recording
    mediaRecorder.start();
    
    // Find connection elements
    const connectionElements = Array.from(canvasElement.querySelectorAll('.connection-path'));
    
    // Animate connections one by one
    for (let i = 0; i < connectionElements.length; i++) {
      const currentConnection = connectionElements[i] as HTMLElement;
      currentConnection.classList.add('animate-connection');
      
      // Wait a bit for animation to be visible
      await new Promise(resolve => setTimeout(resolve, 1000 / speed));
    }
    
    // Record for a bit longer with all connections animated
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Stop recording
    mediaRecorder.stop();
    
    // Reset animations
    connectionElements.forEach(conn => {
      (conn as HTMLElement).classList.remove('animate-connection');
    });
    
  } catch (error) {
    console.error('Error exporting to video:', error);
    throw new Error('Failed to export as video');
  }
};
