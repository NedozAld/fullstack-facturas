import { useEffect, useRef } from 'react';
import './InvoicePreview.css';

const dateFormatter = new Intl.DateTimeFormat('es-EC', {
  dateStyle: 'long',
  timeStyle: 'short',
});

const money = new Intl.NumberFormat('es-EC', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

const runInvoicePrint = () => {
  document.body.classList.add('invoice-print-mode');
  const cleanup = () => {
    document.body.classList.remove('invoice-print-mode');
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);
  window.print();
};

export default function InvoicePreview({ data, onClose, autoPrint = false, onAutoPrintComplete }) {
  const hasAutoPrintedRef = useRef(false);

  useEffect(() => {
    if (!data) return undefined;
    document.body.classList.add('invoice-preview-open');
    return () => {
      document.body.classList.remove('invoice-preview-open');
    };
  }, [data]);

  useEffect(() => {
    if (!autoPrint || !data) {
      if (!autoPrint) hasAutoPrintedRef.current = false;
      return;
    }

    if (hasAutoPrintedRef.current) return;

    hasAutoPrintedRef.current = true;
    runInvoicePrint();
    onAutoPrintComplete?.();
  }, [autoPrint, data, onAutoPrintComplete]);

  if (!data) return null;

  const { client, factura, items, totals, orderCode, generatedAt } = data;
  const invoiceDate = factura?.fac_fecha ? new Date(factura.fac_fecha) : generatedAt;

  return (
    <div className="invoice-overlay" role="dialog" aria-modal="true">
      <div className="invoice-card animate__animated animate__fadeInUp">
        <div className="invoice-actions no-print">
          <button type="button" className="btn btn-light rounded-pill" onClick={onClose}>
            <i className="fas fa-chevron-left me-2" />Cerrar
          </button>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-dark rounded-pill" onClick={runInvoicePrint}>
              <i className="fas fa-print me-2" />Imprimir
            </button>
          </div>
        </div>

        <div className="invoice-header">
          <div>
            <p className="brand-logo">PIZZA<span>MASTER</span></p>
            <p className="mb-0 opacity-75 small">Av. Central 123, Ciudad</p>
            <p className="mb-0 opacity-75 small">Tel: (555) 012-3456</p>
          </div>
          <div className="text-md-end mt-3 mt-md-0">
            <h2 className="fw-bold mb-1">FACTURA</h2>
            <p className="mb-0">Nº Pedido: <span className="fw-bold text-warning">{orderCode}</span></p>
            <p className="mb-0 small opacity-75">Fecha: {dateFormatter.format(invoiceDate)}</p>
          </div>
        </div>

        <div className="invoice-body">
          <div className="row mb-5">
            <div className="col-sm-6">
              <h6 className="text-muted text-uppercase small fw-bold mb-3">Facturado a:</h6>
              <h5 className="fw-bold mb-1">{client?.cli_nombre || 'Consumidor final'}</h5>
              <p className="text-muted mb-1">
                <i className="fas fa-envelope me-2" />{client?.cli_correo || 'sin correo'}
              </p>
              <p className="text-muted mb-0">
                <i className="fas fa-id-card me-2" />Cliente #{client?.cli_id ?? 'N/D'}
              </p>
            </div>
            <div className="col-sm-6 text-sm-end mt-4 mt-sm-0">
              <h6 className="text-muted text-uppercase small fw-bold mb-3">Información:</h6>
              <div className="mb-2">
                <span className="status-badge bg-success-subtle text-success">
                  <i className="fas fa-check-circle me-1" /> Registrada
                </span>
              </div>
              <p className="text-muted mb-1">Factura #{factura?.fac_id ?? 'N/D'}</p>
              <p className="text-muted">Estado: <span className="text-dark fw-semibold">Completada</span></p>
            </div>
          </div>

          <div className="table-responsive mb-5">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th>Descripción</th>
                  <th className="text-center">Cant.</th>
                  <th className="text-end">P. Unit</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr className="item-row" key={item.pro_id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="fw-bold text-dark">{item.pro_nombre}</div>
                      {item.note && (
                        <div className="note-bubble">
                          <i className="far fa-comment-dots me-1" />{item.note}
                        </div>
                      )}
                    </td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-end">{money.format(item.pro_pvp)}</td>
                    <td className="text-end fw-bold">{money.format(item.pro_pvp * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="row justify-content-end">
            <div className="col-lg-4 col-md-6">
              <div className="summary-box">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Subtotal:</span>
                  <span className="fw-medium">{money.format(totals.subtotal)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">IVA (incl.)</span>
                  <span className="fw-medium">{money.format(totals.taxAmount)}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold mb-0 text-dark">TOTAL:</h5>
                  <h4 className="fw-bold mb-0 text-success">{money.format(totals.total)}</h4>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-top text-center text-muted">
            <p className="small mb-1">¡Gracias por preferir nuestra pizzería!</p>
            <p className="small mb-0">Este comprobante es generado electrónicamente.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
