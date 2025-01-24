'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Page() {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [polling, setPolling] = useState<boolean>(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const formatPhoneNumber = (input: string) => {
    if (input.startsWith('0')) {
      return '254' + input.slice(1);
    }
    return input;
  };

  const handleAddAmount = (value: number) => {
    const currentAmount = parseFloat(amount) || 0;
    setAmount((currentAmount + value).toString());
  };

  const pollTransactionStatus = async () => {
    if (!checkoutRequestId) {
      console.log("No CheckoutRequestID set, aborting polling.");
      return;
    }

    setPolling(true);
    let retryCount = 0;
    const maxRetries = 10;

    // Clear any previous intervals
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        console.log("Sending CheckoutRequestID:", checkoutRequestId);

        const response = await fetch("https://api.kibeezy.com/api/query/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            CheckoutRequestID: checkoutRequestId,
            PhoneNumber: phoneNumber, // Include phone number
            Amount: parseFloat(amount), // Include amount
          }),
        });

        const data = await response.json();

        if (response.ok && data.ResultCode === "0") {
          clearInterval(pollIntervalRef.current!); // Stop polling on success
          pollIntervalRef.current = null;
          setPolling(false);
          setCheckoutRequestId(null);
          setPhoneNumber('');
          setAmount('');
          toast.success("Payment successful!");
          router.push("/about");
        } else if (response.ok && data.ResultCode !== "0") {
          clearInterval(pollIntervalRef.current!); // Stop polling on failure
          pollIntervalRef.current = null;
          setPolling(false);
          toast.error(`Payment failed: ${data.ResultDesc}`);
        }
      } catch (error) {
        console.error("Error checking transaction status:", error);
      }

      // Stop polling after max retries
      retryCount += 1;
      if (retryCount >= maxRetries) {
        clearInterval(pollIntervalRef.current!);
        pollIntervalRef.current = null;
        setPolling(false);
        toast.error("Transaction status could not be verified. Please try again later.");
      }
    }, 5000); // Poll every 5 seconds
  };

  useEffect(() => {
    // Clear the interval on component unmount
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const handleBuy = async () => {
    if (isLoading || polling) return;
  
    if (!phoneNumber || !amount) {
      alert('Please enter both a valid phone number and amount.');
      return;
    }
  
    if (!/^(?:254|07)\d{8}$/.test(phoneNumber)) {
      alert('Please enter a valid phone number (e.g., 0712345678 or 254712345678).');
      return;
    }
  
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
    const parsedAmount = parseFloat(amount);
  
    if (isNaN(parsedAmount) || parsedAmount < 10) {
      alert('Please enter a valid amount (minimum KES 10).');
      return;
    }
  
    setIsLoading(true);
    let checkoutRequestId: string | null = null;
  
    // Retry loop to ensure CheckoutRequestID is set
    const maxRetries = 5;  // Max retries to avoid infinite loop
    let retries = 0;
  
    try {
      // Retry fetching CheckoutRequestID
      while (!checkoutRequestId && retries < maxRetries) {
        const response = await fetch("https://api.kibeezy.com/api/stkpush/", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone_number: formattedPhoneNumber,
            amount: parsedAmount,
          }),
        });
  
        const data = await response.json();
        console.log("STK Push Response Data:", data);
  
        // Check if the response is OK and contains a CheckoutRequestID
        if (response.ok && data.CheckoutRequestID) {
          console.log(checkoutRequestId)
          checkoutRequestId = data.CheckoutRequestID;
          console.log(checkoutRequestId)
            toast.success('STK Push initiated successfully! Check your phone.');
      
        } else if (!response.ok) {
          toast.error(`Error: ${data.error || 'Failed to initiate STK Push.'}`);
          break;  // Exit the loop if an error occurs
        } else {
          console.log('Retrying to get CheckoutRequestID...');
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
        }
  
        retries += 1;
      }
  
      // Check if we successfully got the CheckoutRequestID and start polling
      if (checkoutRequestId) {
        setCheckoutRequestId(checkoutRequestId);  // Update state with the valid CheckoutRequestID
        pollTransactionStatus();  // Start polling
      } else {
        toast.error('Failed to initiate STK Push after several attempts.');
      }
  
    } catch (error) {
      console.error('Error initiating STK Push:', error);
      toast.error('An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  

  return (
    <div className='flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8'>
      <div className='mb-8 max-w-md mx-auto'>
        <label
          htmlFor='phone-number'
          className='block text-sm font-medium text-gray-700'
        >
          Enter phone number
        </label>
        <div className='mt-2'>
          <input
            type='tel'
            id='phone-number'
            placeholder='0712345678'
            className='block w-full rounded-full border-2 shadow-lg focus:border-blue-700 focus:ring-blue-700 sm:text-lg px-4 py-3 text-gray-900 placeholder-gray-400'
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
      </div>

      <div className='mb-8 max-w-md mx-auto'>
        <label
          htmlFor='amount'
          className='block text-sm font-medium text-gray-700'
        >
          Enter amount to invest
        </label>
        <div className='mt-2 flex gap-4'>
          <input
            type='number'
            id='amount'
            placeholder='Minimum KES 10'
            className='block w-full rounded-full border-2 shadow-lg focus:border-green-700 focus:ring-green-700 sm:text-lg px-4 py-3 text-gray-900 placeholder-gray-400'
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className='mt-4 flex gap-4 justify-center'>
          {[100, 200, 500, 1000].map((value) => (
            <button
              key={value}
              className='px-4 py-2 bg-gray-200 rounded-full shadow hover:bg-gray-300'
              onClick={() => handleAddAmount(value)}
            >
              +{value}
            </button>
          ))}
        </div>
      </div>

      <div className='max-w-md mx-auto'>
        <button
          className={`w-20 bg-green-500 hover:bg-green-600 text-white py-3 rounded-full shadow-lg ${isLoading || polling ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleBuy}
          disabled={isLoading || polling}
        >
          {isLoading ? "Loading..." : "Invest"}
        </button>
      </div>
      <ToastContainer />
    </div>
  );
}
