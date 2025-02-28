import { useEffect, useState } from "react";
import AnimatedButton from "../ui/AnimatedButton";

interface OrderResponse {
  message: string;
  data: {
    data: {
      id: string;
      amount: number;
      currency: string;
    };
  };
}

interface GuestInfo {
  email?: string;
  firstName?: string;
  lastName?: string;
  isdCode?: string;
  contactNumber?: string;
}

interface RazorpayConfig {
  key: string;
  theme: {
    color: string;
  };
  companyName: string;
}

const DEFAULT_CONFIG: RazorpayConfig = {
  key: "rzp_test_7yuMzPke54N689",
  theme: { color: "#0C66E4" },
  companyName: "Often Travel",
};

const loadRazorpayScript = (src: string) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const RazorpayCheckoutButton = ({
  orderResponse,
  leadGuest,
  config = {},
}: {
  orderResponse: OrderResponse;
  leadGuest: GuestInfo;
  config?: Partial<RazorpayConfig>;
}) => {
  useEffect(() => {
    loadRazorpayScript("https://checkout.razorpay.com/v1/checkout.js");
  }, []);

  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);
      if (!orderResponse?.data?.data?.id || !orderResponse?.data?.data?.amount) {
        throw new Error("Invalid order data received");
      }

      const mergedConfig = { ...DEFAULT_CONFIG, ...config };
      const { id, amount, currency } = orderResponse.data.data;

      const options = {
        key: mergedConfig.key,
        amount: amount,
        currency: currency || "INR",
        name: mergedConfig.companyName,
        description: `Hotel Booking - ${id}`,
        order_id: id,
        prefill: {
          email: leadGuest.email || "",
          contact: leadGuest.contactNumber
            ? `${leadGuest.isdCode}${leadGuest.contactNumber}`
            : "",
          name: `${leadGuest.firstName} ${leadGuest.lastName}`.trim() || "",
        },
        theme: mergedConfig.theme,
        handler: function (response: any) {
          console.log("Payment successful:", response);
          alert("Payment successful!");
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error("Razorpay payment failed:", error);
      alert(error.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedButton disabled={loading} loading={loading} onClick={handlePayment} size='sm' variant="bland">
            {loading ? 'Initiating...' : 'Pay now'}
    </AnimatedButton>
  );
};

export default RazorpayCheckoutButton;