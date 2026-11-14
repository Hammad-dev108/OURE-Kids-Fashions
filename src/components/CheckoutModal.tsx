import { useState } from 'react';
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Truck,
  X,
} from 'lucide-react';
import { formatPrice } from '../data/products';
import { useStore } from '../context/StoreContext';
import type {
  DeliveryDetails,
  OrderReceipt,
  PaymentMethod,
} from '../types/store';

type CheckoutStep = 'delivery' | 'payment' | 'confirmation';

const INITIAL_DELIVERY: DeliveryDetails = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
  city: 'Lahore',
  postalCode: '',
  notes: '',
};

export function CheckoutModal() {
  const {
    checkoutOpen,
    setCheckoutOpen,
    cart,
    currency,
    getProductById,
    subtotalPkr,
    discountPkr,
    giftWrap,
    giftWrapPkr,
    shippingPkr,
    totalPkr,
    promoCode,
    recordOrder,
  } = useStore();

  const [step, setStep] = useState<CheckoutStep>('delivery');
  const [delivery, setDelivery] = useState<DeliveryDetails>(INITIAL_DELIVERY);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [receipt, setReceipt] = useState<OrderReceipt | null>(null);

  if (!checkoutOpen) return null;

  const handleClose = () => {
    setCheckoutOpen(false);
    if (step === 'confirmation') {
      setStep('delivery');
      setReceipt(null);
      setErrorMsg('');
    }
  };

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !delivery.fullName.trim() ||
      !delivery.phone.trim() ||
      !delivery.address.trim() ||
      !delivery.city.trim()
    ) {
      setErrorMsg('Please complete your name, phone number, address, and city.');
      return;
    }
    setErrorMsg('');
    setStep('payment');
  };

  const formatCardDigits = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'card') {
      const rawDigits = cardNumber.replace(/\s/g, '');
      if (
        !cardHolder.trim() ||
        rawDigits.length < 16 ||
        cardExpiry.length < 5 ||
        cardCvc.length < 3
      ) {
        setErrorMsg('Please enter valid cardholder name, 16-digit card number, expiry, and CVC.');
        return;
      }
    }

    const orderNum = `OURA-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReceipt: OrderReceipt = {
      orderNumber: orderNum,
      createdAt: new Date().toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      status: 'Pending',
      items: cart
        .map((c) => {
          const p = getProductById(c.productId);
          if (!p) return null;
          return {
            productId: p.id,
            name: p.name,
            size: c.size,
            quantity: c.quantity,
            unitPricePkr: p.pricePkr,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
      currency,
      subtotalPkr,
      discountPkr,
      giftWrapPkr,
      shippingPkr,
      totalPkr,
      promoCode,
      giftWrap,
      paymentMethod,
      delivery,
      estimatedDelivery: '2–4 Business Days',
    };

    recordOrder(newReceipt);
    setReceipt(newReceipt);
    setErrorMsg('');
    setStep('confirmation');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 overflow-y-auto overscroll-contain flex items-start sm:items-center justify-center p-2 pb-16 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
    >
      <div className="relative flex w-full max-w-2xl flex-col my-0 sm:my-auto rounded-2xl border border-[#E8DFD1] bg-[#FFFFFF] shadow-2xl">
        {/* Header & Step Progress */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-[#E8DFD1] bg-[#FAF6F0] px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <h2
              id="checkout-title"
              className="font-display text-xl sm:text-2xl font-semibold text-[#2C221E]"
            >
              {step === 'delivery' && 'Delivery Details'}
              {step === 'payment' && 'Payment Method'}
              {step === 'confirmation' && 'Order Confirmed'}
            </h2>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-[#6E5D54]">
              <span className={step === 'delivery' ? 'text-[#C8963E] font-semibold' : ''}>
                1. Delivery
              </span>
              <span aria-hidden="true">·</span>
              <span className={step === 'payment' ? 'text-[#C8963E] font-semibold' : ''}>
                2. Payment
              </span>
              <span aria-hidden="true">·</span>
              <span className={step === 'confirmation' ? 'text-[#C8963E] font-semibold' : ''}>
                3. Receipt
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close checkout"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#6E5D54] hover:bg-[#F5EFE6] hover:text-[#2C221E]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6">
          {errorMsg && (
            <div className="mb-4 rounded-lg border border-[#C8963E] bg-[#F4E4D8] px-4 py-2.5 text-xs font-medium text-[#2C221E]">
              {errorMsg}
            </div>
          )}

          {/* Step 1: Delivery Details */}
          {step === 'delivery' && (
            <form onSubmit={handleDeliverySubmit} className="space-y-3.5 sm:space-y-4">
              <div className="grid gap-3.5 sm:gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#6E5D54]">
                    Parent / Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={delivery.fullName}
                    onChange={(e) =>
                      setDelivery({ ...delivery, fullName: e.target.value })
                    }
                    placeholder="Ayesha Khan"
                    className="w-full min-w-0 rounded-lg border border-[#E8DFD1] bg-[#FAF6F0] px-3.5 py-2.5 text-base sm:text-sm text-[#2C221E] placeholder:text-[#6E5D54]/55 focus:border-[#C8963E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#6E5D54]">
                    Mobile Number (for Courier SMS) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={delivery.phone}
                    onChange={(e) =>
                      setDelivery({ ...delivery, phone: e.target.value })
                    }
                    placeholder="+92 300 1234567"
                    className="w-full min-w-0 rounded-lg border border-[#E8DFD1] bg-[#FAF6F0] px-3.5 py-2.5 text-base sm:text-sm text-[#2C221E] placeholder:text-[#6E5D54]/55 focus:border-[#C8963E] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#6E5D54]">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={delivery.address}
                  onChange={(e) =>
                    setDelivery({ ...delivery, address: e.target.value })
                  }
                  placeholder="House 14-B, Gulberg III"
                  className="w-full min-w-0 rounded-lg border border-[#E8DFD1] bg-[#FAF6F0] px-3.5 py-2.5 text-base sm:text-sm text-[#2C221E] placeholder:text-[#6E5D54]/55 focus:border-[#C8963E] focus:outline-none"
                />
              </div>

              <div className="grid gap-3.5 sm:gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#6E5D54]">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={delivery.city}
                    onChange={(e) =>
                      setDelivery({ ...delivery, city: e.target.value })
                    }
                    className="w-full min-w-0 rounded-lg border border-[#E8DFD1] bg-[#FAF6F0] px-3.5 py-2.5 text-base sm:text-sm text-[#2C221E] focus:border-[#C8963E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#6E5D54]">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={delivery.postalCode}
                    onChange={(e) =>
                      setDelivery({ ...delivery, postalCode: e.target.value })
                    }
                    placeholder="54660"
                    className="w-full min-w-0 rounded-lg border border-[#E8DFD1] bg-[#FAF6F0] px-3.5 py-2.5 text-base sm:text-sm text-[#2C221E] placeholder:text-[#6E5D54]/55 focus:border-[#C8963E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#6E5D54]">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={delivery.email}
                    onChange={(e) =>
                      setDelivery({ ...delivery, email: e.target.value })
                    }
                    placeholder="receipt@example.com"
                    className="w-full min-w-0 rounded-lg border border-[#E8DFD1] bg-[#FAF6F0] px-3.5 py-2.5 text-base sm:text-sm text-[#2C221E] placeholder:text-[#6E5D54]/55 focus:border-[#C8963E] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#6E5D54]">
                  Gift Card Message or Delivery Note
                </label>
                <textarea
                  rows={2}
                  value={delivery.notes}
                  onChange={(e) =>
                    setDelivery({ ...delivery, notes: e.target.value })
                  }
                  placeholder="Optional note for gift wrap or courier arrival..."
                  className="w-full min-w-0 rounded-lg border border-[#E8DFD1] bg-[#FAF6F0] px-3.5 py-2 text-base sm:text-sm text-[#2C221E] placeholder:text-[#6E5D54]/55 focus:border-[#C8963E] focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E8DFD1] pt-4">
                <div className="text-xs text-[#6E5D54]">
                  Total Payable:{' '}
                  <strong className="tabular-nums text-sm text-[#2C221E]">
                    {formatPrice(totalPkr, currency)}
                  </strong>
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto rounded-lg bg-[#C8963E] px-6 py-3 text-sm font-semibold text-[#FFFFFF] transition-colors hover:bg-[#E0AF50] hover:text-[#2C221E]"
                >
                  Continue to Payment
                </button>
              </div>
              <div className="h-16 sm:h-4 shrink-0" aria-hidden="true" />
            </form>
          )}

          {/* Step 2: Payment Method */}
          {step === 'payment' && (
            <form onSubmit={handleConfirmOrder} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('cod');
                    setErrorMsg('');
                  }}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 sm:p-4 text-left transition-colors ${
                    paymentMethod === 'cod'
                      ? 'border-[#C8963E] bg-[#F4E4D8]'
                      : 'border-[#E8DFD1] bg-[#FAF6F0] hover:border-[#C8963E]'
                  }`}
                >
                  <Banknote className="mt-0.5 h-5 w-5 text-[#C8963E] shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[#2C221E]">
                      Cash on Delivery (COD)
                    </p>
                    <p className="mt-1 text-xs text-[#6E5D54]">
                      Pay exact amount upon courier doorstep arrival.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('card');
                    setErrorMsg('');
                  }}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 sm:p-4 text-left transition-colors ${
                    paymentMethod === 'card'
                      ? 'border-[#C8963E] bg-[#F4E4D8]'
                      : 'border-[#E8DFD1] bg-[#FAF6F0] hover:border-[#C8963E]'
                  }`}
                >
                  <CreditCard className="mt-0.5 h-5 w-5 text-[#C8963E] shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[#2C221E]">
                      Credit / Debit Card
                    </p>
                    <p className="mt-1 text-xs text-[#6E5D54]">
                      Visa, Mastercard, or PayPak encrypted checkout.
                    </p>
                  </div>
                </button>
              </div>

              {paymentMethod === 'cod' ? (
                <div className="rounded-xl border border-[#E8DFD1] bg-[#FAF6F0] p-4 text-xs leading-relaxed text-[#6E5D54]">
                  <div className="flex items-center gap-2 font-semibold text-[#2C221E]">
                    <Truck className="h-4 w-4 text-[#C8963E]" />
                    <span>Cash on Delivery Summary</span>
                  </div>
                  <p className="mt-2">
                    Our courier will call{' '}
                    <span className="font-medium text-[#2C221E]">{delivery.phone}</span> prior to delivery in{' '}
                    <span className="font-medium text-[#2C221E]">{delivery.city}</span>. Payable on arrival:{' '}
                    <strong className="tabular-nums text-[#C8963E]">
                      {formatPrice(totalPkr, currency)}
                    </strong>
                    .
                  </p>
                </div>
              ) : (
                <div className="space-y-3 rounded-xl border border-[#E8DFD1] bg-[#FAF6F0] p-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#6E5D54]">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Name on card"
                      className="w-full min-w-0 rounded-lg border border-[#E8DFD1] bg-[#FFFFFF] px-3 py-2 text-base sm:text-sm text-[#2C221E] placeholder:text-[#6E5D54]/55 focus:border-[#C8963E] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#6E5D54]">
                      Card Number
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cardNumber}
                      onChange={(e) =>
                        setCardNumber(formatCardDigits(e.target.value))
                      }
                      placeholder="4242 4242 4242 4242"
                      className="tabular-nums w-full min-w-0 rounded-lg border border-[#E8DFD1] bg-[#FFFFFF] px-3 py-2 text-base sm:text-sm text-[#2C221E] placeholder:text-[#6E5D54]/55 focus:border-[#C8963E] focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#6E5D54]">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cardExpiry}
                        onChange={(e) =>
                          setCardExpiry(formatExpiry(e.target.value))
                        }
                        placeholder="08/29"
                        className="tabular-nums w-full min-w-0 rounded-lg border border-[#E8DFD1] bg-[#FFFFFF] px-3 py-2 text-base sm:text-sm text-[#2C221E] placeholder:text-[#6E5D54]/55 focus:border-[#C8963E] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#6E5D54]">
                        CVC
                      </label>
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) =>
                          setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))
                        }
                        placeholder="123"
                        className="tabular-nums w-full min-w-0 rounded-lg border border-[#E8DFD1] bg-[#FFFFFF] px-3 py-2 text-base sm:text-sm text-[#2C221E] placeholder:text-[#6E5D54]/55 focus:border-[#C8963E] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E8DFD1] pt-4">
                <button
                  type="button"
                  onClick={() => setStep('delivery')}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#6E5D54] hover:text-[#2C221E]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Delivery</span>
                </button>

                <button
                  type="submit"
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-[#C8963E] px-6 py-3 text-sm font-semibold text-[#FFFFFF] transition-colors hover:bg-[#E0AF50] hover:text-[#2C221E]"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>
                    Confirm Order ({formatPrice(totalPkr, currency)})
                  </span>
                </button>
              </div>
              <div className="h-16 sm:h-4 shrink-0" aria-hidden="true" />
            </form>
          )}

          {/* Step 3: Order Confirmation Receipt */}
          {step === 'confirmation' && receipt && (
            <div className="space-y-4">
              <div className="flex items-start gap-3.5 rounded-xl border border-[#C8963E] bg-[#F4E4D8] p-4">
                <CheckCircle2 className="mt-0.5 h-6 w-6 text-[#C8963E] shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[#2C221E]">
                    Order #{receipt.orderNumber} Confirmed — Preparing Boutique Parcel
                  </p>
                  <p className="mt-1 text-xs text-[#6E5D54]">
                    Estimated delivery: {receipt.estimatedDelivery} to{' '}
                    <span className="font-medium text-[#2C221E]">{receipt.delivery.city}</span>. Saved to your local order receipts.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-[#E8DFD1] bg-[#FAF6F0] p-4 space-y-3 text-xs">
                <div className="flex justify-between gap-2 border-b border-[#E8DFD1] pb-2.5 text-[#6E5D54]">
                  <span className="shrink-0">Recipient</span>
                  <span className="text-right font-medium text-[#2C221E]">
                    {receipt.delivery.fullName} · {receipt.delivery.phone}
                  </span>
                </div>
                <div className="flex justify-between gap-2 border-b border-[#E8DFD1] pb-2.5 text-[#6E5D54]">
                  <span className="shrink-0">Shipping Address</span>
                  <span className="text-right font-medium text-[#2C221E]">
                    {receipt.delivery.address}, {receipt.delivery.city}
                  </span>
                </div>
                <div className="flex justify-between gap-2 border-b border-[#E8DFD1] pb-2.5 text-[#6E5D54]">
                  <span className="shrink-0">Payment</span>
                  <span className="text-right font-medium text-[#2C221E]">
                    {receipt.paymentMethod === 'cod'
                      ? 'Cash on Delivery (COD)'
                      : 'Card Payment Approved'}
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  {receipt.items.map((item) => (
                    <div
                      key={`${item.productId}-${item.size}`}
                      className="flex justify-between gap-2 text-[#2C221E]"
                    >
                      <span>
                        {item.quantity}x {item.name} ({item.size})
                      </span>
                      <span className="shrink-0 tabular-nums font-medium text-[#2C221E]">
                        {formatPrice(
                          item.unitPricePkr * item.quantity,
                          receipt.currency
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between border-t border-[#E8DFD1] pt-3 text-sm font-semibold text-[#C8963E]">
                  <span className="text-[#2C221E]">Total {receipt.paymentMethod === 'cod' ? 'Due on Delivery' : 'Paid'}</span>
                  <span className="tabular-nums">
                    {formatPrice(receipt.totalPkr, receipt.currency)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full rounded-lg bg-[#C8963E] py-3 text-sm font-semibold text-[#FFFFFF] transition-colors hover:bg-[#E0AF50] hover:text-[#2C221E]"
              >
                Continue Shopping
              </button>
              <div className="h-16 sm:h-4 shrink-0" aria-hidden="true" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}