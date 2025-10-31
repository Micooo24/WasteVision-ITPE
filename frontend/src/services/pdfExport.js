import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// You'll need to add these logos to your assets/img folder
// For now, we'll handle missing logos gracefully
const getLogoPath = (logoName) => {
  try {
    return new URL(`../assets/img/${logoName}`, import.meta.url).href;
  } catch {
    return null;
  }
};

export const exportHistoryToPDF = async (historyData, userInfo) => {
  try {
    // Create new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Header Section
    const headerHeight = 45;
    const logoSize = 25; // Consistent logo size
    const logoY = 10; // Vertical position for logos
    
    // Try to add logos (handle gracefully if not found)
    const wastevisionLogo = getLogoPath('wastevision-logo.png');
    const tupLogo = getLogoPath('tup-logo.png');
    
    // Calculate positions for balanced layout
    const leftLogoX = 20; // Left logo position
    const rightLogoX = pageWidth - 20 - logoSize; // Right logo position
    
    if (wastevisionLogo) {
      try {
        doc.addImage(wastevisionLogo, 'PNG', leftLogoX, logoY, logoSize, logoSize);
      } catch (error) {
        console.warn('WasteVision logo not found or failed to load');
      }
    }
    
    if (tupLogo) {
      try {
        doc.addImage(tupLogo, 'PNG', rightLogoX, logoY, logoSize, logoSize);
      } catch (error) {
        console.warn('TUP logo not found or failed to load');
      }
    }
    
    // Title and description (center) - positioned below logos
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('WasteVision Classification History Report', pageWidth / 2, 23, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('AI-Powered Waste Classification and Environmental Data Report', pageWidth / 2, 29, { align: 'center' });
    
    // Add line separator
    doc.setLineWidth(0.5);
    doc.line(15, headerHeight - 5, pageWidth - 15, headerHeight - 5);
    
    // User Information Section
    let yPosition = headerHeight + 5;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Report Information', 15, yPosition);
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const reportInfo = [
      ['Generated Date:', new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })],
      ['User:', userInfo?.name || 'N/A'],
      ['Email:', userInfo?.email || 'N/A'],
      ['Total Classifications:', historyData.length.toString()],
      ['Report Period:', getDateRange(historyData)]
    ];
    
    reportInfo.forEach(([label, value]) => {
      doc.text(label, 15, yPosition);
      doc.text(value, 80, yPosition);
      yPosition += 6;
    });
    
    // Statistics Section
    yPosition += 10;
    const stats = calculateStatistics(historyData);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Classification Statistics', 15, yPosition);
    
    yPosition += 10;
    
    // Use autoTable function directly
    autoTable(doc, {
      startY: yPosition,
      head: [['Category', 'Count', 'Percentage']],
      body: Object.entries(stats.byCategory).map(([category, count]) => [
        category,
        count.toString(),
        `${((count / historyData.length) * 100).toFixed(1)}%`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [76, 175, 80] },
      margin: { left: 15, right: 15 }
    });
    
    // Recyclable vs Non-Recyclable Statistics
    const finalY = doc.lastAutoTable.finalY + 15;
    
    autoTable(doc, {
      startY: finalY,
      head: [['Type', 'Count', 'Percentage']],
      body: [
        ['Recyclable', stats.recyclable.toString(), `${((stats.recyclable / historyData.length) * 100).toFixed(1)}%`],
        ['Non-Recyclable', stats.nonRecyclable.toString(), `${((stats.nonRecyclable / historyData.length) * 100).toFixed(1)}%`]
      ],
      theme: 'striped',
      headStyles: { fillColor: [33, 150, 243] },
      margin: { left: 15, right: 15 }
    });
    
    // Classification History Table
    const historyStartY = doc.lastAutoTable.finalY + 20;
    
    // Check if we need a new page
    if (historyStartY > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    } else {
      yPosition = historyStartY;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Classification History', 15, yPosition);
    
    // Prepare table data
    const tableData = historyData.map((record, index) => [
      (index + 1).toString(),
      new Date(record.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      record.items?.[0]?.item || 'Unknown',
      record.items?.[0]?.type || 'Unknown',
      record.items?.[0] ? `${Math.round(record.items[0].confidence * 100)}%` : 'N/A',
      record.items?.[0]?.recyclable ? 'Yes' : 'No'
    ]);
    
    autoTable(doc, {
      startY: yPosition + 10,
      head: [['#', 'Date', 'Item', 'Category', 'Confidence', 'Recyclable']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [76, 175, 80] },
      margin: { left: 15, right: 15 },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 25 },
        2: { cellWidth: 35 },
        3: { cellWidth: 30 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 }
      }
    });
    
    // Environmental Impact Summary (if space allows or on new page)
    if (doc.lastAutoTable.finalY > pageHeight - 80) {
      doc.addPage();
      yPosition = 20;
    } else {
      yPosition = doc.lastAutoTable.finalY + 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Environmental Impact Summary', 15, yPosition);
    
    yPosition += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const impactText = [
      `Total waste items classified: ${historyData.length}`,
      `Recyclable items identified: ${stats.recyclable} (${((stats.recyclable / historyData.length) * 100).toFixed(1)}%)`,
      `Average classification confidence: ${stats.averageConfidence.toFixed(1)}%`,
      `Most common waste category: ${stats.mostCommonCategory}`,
      `Classification accuracy rate: ${stats.highConfidenceCount}/${historyData.length} (${((stats.highConfidenceCount / historyData.length) * 100).toFixed(1)}%)`
    ];
    
    impactText.forEach(text => {
      doc.text(text, 15, yPosition);
      yPosition += 8;
    });
    
    // Add environmental message
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    const message = 'By using WasteVision for proper waste classification, you are contributing to environmental sustainability and promoting responsible waste management practices.';
    const splitMessage = doc.splitTextToSize(message, pageWidth - 30);
    doc.text(splitMessage, 15, yPosition);
    
    // Footer
    const addFooter = () => {
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        doc.text(
          'Generated by WasteVision - AI-Powered Waste Management System',
          pageWidth / 2,
          pageHeight - 5,
          { align: 'center' }
        );
      }
    };
    
    addFooter();
    
    // Save the PDF
    const fileName = `wastevision-history-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    return { success: true, fileName };
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error: error.message };
  }
};

// Helper functions
const getDateRange = (historyData) => {
  if (historyData.length === 0) return 'No data';
  
  const dates = historyData.map(record => new Date(record.createdAt));
  const earliest = new Date(Math.min(...dates));
  const latest = new Date(Math.max(...dates));
  
  const formatDate = (date) => date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  
  if (earliest.getTime() === latest.getTime()) {
    return formatDate(earliest);
  }
  
  return `${formatDate(earliest)} - ${formatDate(latest)}`;
};

const calculateStatistics = (historyData) => {
  const stats = {
    byCategory: {},
    recyclable: 0,
    nonRecyclable: 0,
    totalConfidence: 0,
    highConfidenceCount: 0,
    mostCommonCategory: 'Unknown',
    averageConfidence: 0
  };
  
  historyData.forEach(record => {
    if (record.items && record.items.length > 0) {
      const item = record.items[0];
      
      // Category statistics
      const category = item.type || 'Unknown';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      
      // Recyclable statistics
      if (item.confidence && item.confidence > 0.7) {
        if (item.recyclable || category.toLowerCase().includes('recyclable')) {
          stats.recyclable++;
        } else {
          stats.nonRecyclable++;
        }
        stats.highConfidenceCount++;
      }
      
      // Confidence statistics
      stats.totalConfidence += (item.confidence || 0) * 100;
    }
  });
  
  // Calculate averages and most common
  if (historyData.length > 0) {
    stats.averageConfidence = stats.totalConfidence / historyData.length;
    stats.mostCommonCategory = Object.entries(stats.byCategory)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';
  }
  
  return stats;
};