/**
 * Export functionality for the Flow Diagram Creator
 */

// Default export options
const defaultExportOptions = {
  filename: 'flow-diagram',
  quality: 'medium',
  speed: 1,
  width: 0,
  height: 0
};

// Initialize export functionality
function initializeExport() {
  // Export buttons
  document.getElementById('export-gif').addEventListener('click', () => showExportModal('gif'));
  document.getElementById('export-video').addEventListener('click', () => showExportModal('video'));
  
  // Export modal handlers
  document.getElementById('close-modal').addEventListener('click', hideExportModal);
  document.getElementById('export-cancel').addEventListener('click', hideExportModal);
  document.getElementById('export-confirm').addEventListener('click', handleExportConfirm);
}

// Show export modal
function showExportModal(type) {
  const modal = document.getElementById('export-modal');
  const exportTypeSpan = document.getElementById('export-type');
  
  // Set export type
  exportTypeSpan.textContent = type.toUpperCase();
  
  // Set default filename
  document.getElementById('filename').value = `flow-diagram-${formatDateTime()}.${type}`;
  
  // Show modal
  modal.classList.add('open');
}

// Hide export modal
function hideExportModal() {
  const modal = document.getElementById('export-modal');
  modal.classList.remove('open');
}

// Handle export confirmation
function handleExportConfirm() {
  const exportType = document.getElementById('export-type').textContent.toLowerCase();
  
  // Get export options
  const options = {
    filename: document.getElementById('filename').value,
    quality: document.getElementById('quality').value,
    speed: parseFloat(document.getElementById('speed').value)
  };
  
  // Hide modal
  hideExportModal();
  
  // Show loading toast
  showToast('Preparing export...', 'Please wait', 'success');
  
  // Start export process
  if (exportType === 'gif') {
    exportToGIF(options);
  } else {
    exportToVideo(options);
  }
}

// Export to GIF
async function exportToGIF(options) {
  try {
    // Merge with default options
    const exportOptions = { ...defaultExportOptions, ...options };
    
    // Create a clone of the canvas for export
    const canvasClone = await prepareCanvasForExport();
    
    // Set size in exportOptions
    exportOptions.width = canvasClone.offsetWidth;
    exportOptions.height = canvasClone.offsetHeight;
    
    // Set GIF quality (lower is better quality but slower)
    let gifQuality = 10;
    let gifWorkers = 4;
    
    if (exportOptions.quality === 'low') {
      gifQuality = 20;
      gifWorkers = 2;
    } else if (exportOptions.quality === 'high') {
      gifQuality = 5;
      gifWorkers = 8;
    }
    
    // Create GIF
    const gif = new GIF({
      workers: gifWorkers,
      quality: gifQuality,
      width: exportOptions.width,
      height: exportOptions.height,
      workerScript: 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js'
    });
    
    // Prepare export
    document.body.appendChild(canvasClone);
    
    // Start animation
    const flowState = getFlowState();
    const originalAnimState = flowState.isAnimating;
    flowState.isAnimating = true;
    updateCanvas();
    
    // Generate frames
    let frameCount = 0;
    const frameLimit = 30; // Limit frames to prevent excessive memory use
    
    const generateFrame = async () => {
      if (frameCount >= frameLimit) {
        completeGIF();
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 50 / exportOptions.speed));
      
      // Capture frame
      html2canvas(canvasClone, {
        backgroundColor: '#FFFFFF'
      }).then(frameCanvas => {
        gif.addFrame(frameCanvas, { delay: 200 / exportOptions.speed, copy: true });
        frameCount++;
        generateFrame();
      });
    };
    
    const completeGIF = () => {
      gif.on('finished', blob => {
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = exportOptions.filename.endsWith('.gif') 
          ? exportOptions.filename 
          : `${exportOptions.filename}.gif`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          document.body.removeChild(canvasClone);
          
          // Restore animation state
          flowState.isAnimating = originalAnimState;
          updateCanvas();
          
          showToast('Export complete!', 'GIF Exported', 'success');
        }, 100);
      });
      
      // Render GIF
      gif.render();
    };
    
    // Start generating frames
    generateFrame();
    
  } catch (error) {
    console.error('Error exporting to GIF:', error);
    showToast('Error exporting to GIF', 'Export Failed', 'error');
  }
}

// Export to Video
async function exportToVideo(options) {
  try {
    // As this is much more complex and requires additional dependencies,
    // we'll use a simplified approach for this implementation:
    // Just create a high-quality animated GIF instead
    showToast('Creating video export (GIF format)', 'Please wait', 'success');
    
    // Create a higher quality GIF
    const videoOptions = { 
      ...options,
      quality: 'high',
      filename: options.filename.replace('.mp4', '.gif')
    };
    
    exportToGIF(videoOptions);
    
  } catch (error) {
    console.error('Error exporting to video:', error);
    showToast('Error exporting to video', 'Export Failed', 'error');
  }
}

// Prepare canvas for export
async function prepareCanvasForExport() {
  // Create a clone of the canvas
  const originalCanvas = document.getElementById('canvas');
  const canvasClone = originalCanvas.cloneNode(true);
  canvasClone.id = 'canvas-export';
  canvasClone.style.position = 'absolute';
  canvasClone.style.left = '-9999px';
  canvasClone.style.top = '-9999px';
  
  // Reset transform to ensure proper export
  canvasClone.style.transform = 'none';
  
  return canvasClone;
}