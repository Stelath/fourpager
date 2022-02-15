import { useState } from 'react';
import { styled } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import { Button, Box } from '@material-ui/core';
import { PDFDocument, PageSizes } from 'pdf-lib'
import FileSaver, { saveAs } from 'file-saver';
import JSZip from 'jszip';

import './assets/css/App.css';

import banner from './assets/images/FourPagerBanner.svg';

function App() {
  const [downloadAvailable, setDownloadAvailable] = useState(false);
  const [progressValue, setProgressValue] = useState(0);

  const [filename, setFilename] = useState('');
  const [file, setFile] = useState(null);

  const reformatPDF = async (originalPdfBytes) => {
    originalPdfBytes = Uint8Array.from(originalPdfBytes);
    const originalPdf = await PDFDocument.load(originalPdfBytes);
    const originalPages = originalPdf.getPages();
    
    var pdfDocs = [];
    
    for (var i = 0; i < originalPages.length; i+=4) {
      const pdfDoc = await PDFDocument.create();
      const copiedPages = await pdfDoc.copyPages(originalPdf, [...Array(originalPages.length).keys()].slice(i, i+4));
      copiedPages.forEach((copiedPage) => {
        pdfDoc.addPage(copiedPage);
      });
      const pdfBytes = await pdfDoc.save()

      pdfDocs.push(pdfBytes);
      setProgressValue(i/originalPages.length*100*0.75);
    }
    
    // creating archives
    var zip = new JSZip();
    
    pdfDocs.forEach((pdfDoc, idx) => {
      zip.file(`${filename}_${idx * 4 + 1}-${idx * 4 + 4}.pdf`, pdfDoc);
    });
    setFile(zip);

    setProgressValue(100);
    setDownloadAvailable(true);
  }
  
  const onFileChange = (event) => {
    var reader = new FileReader();
    var fileByteArray = [];
    reader.readAsArrayBuffer(event.target.files[0]);
    setFilename(event.target.files[0].name.split('.')[0]);
    reader.onloadend = (evt) => {
        if (evt.target.readyState === FileReader.DONE) {
          var arrayBuffer = evt.target.result,
              array = new Uint8Array(arrayBuffer);
          for (var i = 0; i < array.length; i++) {
              fileByteArray.push(array[i]);
          }
          reformatPDF(fileByteArray);
        }
    }
  };
  
  const onDownloadButtonClicked = () => {
    file.generateAsync({type:"blob"}).then(function(content) {
      saveAs(content, filename + '.zip');
    });
  }
  
  const Input = styled('input')({
    display: 'none',
  });

  return (
    <div className='App'>
      <img className='banner' src={banner} alt='Banner'></img>
      <Box visibility={(progressValue > 0) ? 'visible' : 'hidden'} sx={{ width: '70%' }}>
        <LinearProgress variant="determinate" value={progressValue} />
      </Box>
      <div id='upload-container'>
        <label htmlFor='pdf-upload-button'>
          <Input accept='.pdf' id='pdf-upload-button' multiple type='file' onChange={onFileChange}/>
          <Button variant='contained' component='span'>
            Upload PDF
          </Button>
        </label>
        <Button variant='contained' component='span' onClick={onDownloadButtonClicked} disabled={!downloadAvailable} style={{marginLeft: '10px'}}>
          Download PDF
        </Button>
      </div>
    </div>
  );
}

export default App;
