import { useState } from 'react';
import { styled } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import { Button, Box } from '@material-ui/core';
import { PDFDocument, PageSizes } from 'pdf-lib'

import './assets/css/App.css';

import banner from './assets/images/FourPagerBanner.svg';

function App() {
  const [downloadAvailable, setDownloadAvailable] = useState(false);
  const [progressValue, setProgressValue] = useState(0);

  const [filename, setFilename] = useState('');
  const [pdf, setPdf] = useState(null);

  const reformatPDF = async (originalPdfBytes) => {
    originalPdfBytes = Uint8Array.from(originalPdfBytes);
    
    const pdfDoc = await PDFDocument.create();
  
    const originalPdf = await PDFDocument.load(originalPdfBytes);
    const pages = originalPdf.getPages();
  
    const embeddedPages = await pdfDoc.embedPages(pages);
    const pageDims = embeddedPages.map(embeddedPage => (
      embeddedPage.scale(0.4704)
    ));

    setProgressValue(25);
    
    var newPages = []
    for (var i = 0; i < pages.length; i++) {
      if (i % 4 === 0) {
        newPages.push(pdfDoc.addPage(PageSizes.Letter));
      }
    }

    setProgressValue(60);
  
    embeddedPages.forEach((embeddedPage, i) => {
      const page = newPages[Math.floor(i / 4)]
      page.drawPage(embeddedPage, {
        ...pageDims[i],
        x: (i % 2 === 0) ? 15.18 : 308.939,
        y: (Math.floor((i % 4) / 2) === 0) ? 401.601 : 17.84,
      });
    });
    setProgressValue(90);
  
    const pdfBytes = await pdfDoc.save()
  
    var blob = new Blob([pdfBytes], { type: 'application/pdf' });
    setPdf(blob);

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
    var tempLink = document.createElement('a');
    var csvURL = window.URL.createObjectURL(pdf);
    tempLink = document.createElement('a');
    tempLink.href = csvURL;
    tempLink.setAttribute('download', (filename + ' Formatted.pdf'));
    tempLink.click();
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
