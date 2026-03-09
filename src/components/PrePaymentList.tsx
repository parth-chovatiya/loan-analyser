import type { PrePayment } from '../types/loan';
import { formatCurrency, formatDateFull } from '../utils/formatters';
import { PrePaymentForm } from './PrePaymentForm';

interface Props {
  prePayments: PrePayment[];
  onAdd: (pp: PrePayment) => void;
  onRemove: (id: string) => void;
}

export function PrePaymentList({ prePayments, onAdd, onRemove }: Props) {
  const sorted = [...prePayments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Pre-Payments
      </h2>
      <PrePaymentForm onAdd={onAdd} />
      {sorted.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-600">
                <th className="pb-2 pr-4 font-medium">Date</th>
                <th className="pb-2 pr-4 font-medium">Amount</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((pp) => (
                <tr
                  key={pp.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="py-2 pr-4">{formatDateFull(pp.date)}</td>
                  <td className="py-2 pr-4">{formatCurrency(pp.amount)}</td>
                  <td className="py-2">
                    <button
                      onClick={() => onRemove(pp.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
