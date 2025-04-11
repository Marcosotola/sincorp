// components/pdf/PresupuestoPDF.js
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1A5276',
    paddingBottom: 10
  },
  logoContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoSubText: {
    fontSize: 8,
    color: '#666',
    marginTop: 2
  },
  headerInfo: {
    fontSize: 9,
    textAlign: 'right',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#1A5276'
  },
  section: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoColumn: {
    flex: 1,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    backgroundColor: '#f5f5f5',
    padding: 5,
    color: '#1A5276'
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 5,
  },
  col4: {
    flex: 4,
  },
  col3: {
    flex: 3,
  },
  col2: {
    flex: 2,
  },
  col1: {
    flex: 1,
  },
  colHeader: {
    fontWeight: 'bold',
    fontSize: 10,
  },
  colContent: {
    fontSize: 9,
  },
  infoBlock: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  horizontalInfoBlocks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  label: {
    fontSize: 9,
    fontWeight: 'bold',
    flex: 1,
  },
  value: {
    fontSize: 9,
    flex: 2,
  },
  tableHeader: {
    backgroundColor: '#1A5276',
    color: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 5,
    fontSize: 10,
    fontWeight: 'bold',
    flexDirection: 'row',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 6,
    paddingHorizontal: 5,
    fontSize: 9,
  },
  oddRow: {
    backgroundColor: '#f9f9f9',
  },
  totals: {
    marginTop: 10,
    marginLeft: 'auto',
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 9,
  },
  totalValue: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: '#333',
    marginTop: 2,
  },
  grandTotalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1A5276',
  },
  grandTotalValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1A5276',
  },
  notes: {
    fontSize: 9,
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#1A5276',
    paddingTop: 10,
    fontSize: 8,
    textAlign: 'center',
    color: '#666',
  },
});

// Función para formatear la fecha a DD/MM/AAAA
const formatDate = (dateString) => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const PresupuestoPDF = ({ presupuesto }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Encabezado */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>
            <Text style={{ color: '#1A5276' }}>Sin</Text>
            <Text style={{ color: '#2E86C1' }}>corp</Text>
          </Text>
          <Text style={styles.logoSubText}> Servicios Integrales</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text>Email: sincorpserviciosintegrales@gmail.com</Text>
          <Text>Teléfono: (351) 681 0777</Text>
          <Text>Web: www.sincorp.vercel.app</Text>
        </View>
      </View>

      {/* Título */}
      <Text style={styles.title}>PRESUPUESTO</Text>

      {/* Información del presupuesto y cliente en horizontal */}
      <View style={styles.horizontalInfoBlocks}>
        {/* Información del presupuesto */}
        <View style={[styles.infoBlock, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.sectionTitle}>Detalles del Presupuesto</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Número:</Text>
            <Text style={styles.value}>{presupuesto.numero}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Fecha:</Text>
            <Text style={styles.value}>{formatDate(presupuesto.fecha)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Validez:</Text>
            <Text style={styles.value}>{presupuesto.validez}</Text>
          </View>
        </View>

        {/* Información del cliente */}
        <View style={[styles.infoBlock, { flex: 1 }]}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.value}>{presupuesto.cliente.nombre}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Empresa:</Text>
            <Text style={styles.value}>{presupuesto.cliente.empresa}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{presupuesto.cliente.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Tel:</Text>
            <Text style={styles.value}>{presupuesto.cliente.telefono}</Text>
          </View>
        </View>
      </View>

      {/* Tabla de items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detalle de Items</Text>
        
        <View style={styles.tableHeader}>
          <Text style={[styles.col4, styles.colHeader]}>Descripción</Text>
          <Text style={[styles.col1, styles.colHeader]}>Cant.</Text>
          <Text style={[styles.col2, styles.colHeader]}>Precio Unit.</Text>
          <Text style={[styles.col2, styles.colHeader]}>Subtotal</Text>
        </View>
        
        {presupuesto.items.map((item, index) => (
          <View key={item.id} style={[styles.tableRow, index % 2 === 1 ? styles.oddRow : {}]}>
            <Text style={[styles.col4, styles.colContent]}>{item.descripcion}</Text>
            <Text style={[styles.col1, styles.colContent]}>{parseFloat(item.cantidad || 0)}</Text>
            <Text style={[styles.col2, styles.colContent]}>${parseFloat(item.precioUnitario || 0).toFixed(2)}</Text>
            <Text style={[styles.col2, styles.colContent]}>${parseFloat(item.subtotal || 0).toFixed(2)}</Text>
          </View>
        ))}

        {/* Totales */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>${parseFloat(presupuesto.subtotal || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>TOTAL:</Text>
            <Text style={styles.grandTotalValue}>${parseFloat(presupuesto.total || 0).toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Notas */}
      <View style={styles.notes}>
        <Text style={styles.sectionTitle}>Notas y Condiciones</Text>
        <Text style={styles.colContent}>{presupuesto.notas}</Text>
      </View>

      {/* Pie de página */}
      <View style={styles.footer}>
        <Text>SINCORP Servicios Integrales - CUIT: 20-24471842-7</Text>
        <Text>Av. Luciano Torrent 4800, 5000 - Cordoba - Tel: (351) 681 0777 - www.sincorp.vercel.app</Text>
      </View>
    </Page>
  </Document>
);

export default PresupuestoPDF;