import './stylesheets/index.css'
import { React, useState, useEffect } from "react";
import axios from "axios";
import { Tooltip } from "react-tooltip";
import Swal from "sweetalert2";
import IconListBox from './components/IconListBox';

export default function App() {
  const [selectedCurrencyFrom, setSelectedCurrencyFrom] = useState([]);
  const [selectedCurrencyTo, setSelectedCurrencyTo] = useState([]);
  const [allCurrencies, setAllCurrencies] = useState([]);
  const [amountPay, setAmountPay] = useState("");
  const [amountReceive, setAmountReceive] = useState("");

  useEffect(() => {
    mapCurrencyData();
  }, []);

  async function getCurrencyData() {
    try {
      const response = await axios.get(
        "https://interview.switcheo.com/prices.json",
        {}
      );
      const currencies = await response.data;
      return currencies;
    } catch (err) {
      console.log(`Unable to fetch curriencies: ${err}`);
    }
  }

  function processData(currencyData) {
    const uniqueCurrencies = new Map();
    currencyData.forEach((item) => {
      if (!uniqueCurrencies.has(item.currency) && item.price !== undefined) {
        uniqueCurrencies.set(item.currency, {
          ...item,
          avatar: `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${item.currency}.svg?raw=true`,
        });
      }
    });
    return Array.from(uniqueCurrencies.values());
  }

  async function mapCurrencyData() {
    const currencyData = await getCurrencyData();
    const filteredCurrencyData = processData(currencyData);

    if (filteredCurrencyData.length >= 2) {
      setSelectedCurrencyFrom(filteredCurrencyData[0]);
      setSelectedCurrencyTo(filteredCurrencyData[1]);
    }
    setAllCurrencies(filteredCurrencyData);
  }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      Swal.fire({
        title: "Confirm to convert the currency?",
        text: `${amountPay} ${selectedCurrencyFrom?.currency} to ${amountReceive} ${selectedCurrencyTo?.currency}`,
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Yes, convert it!",
        cancelButtonText: "No, cancel it!",
        confirmButtonColor: "#0275d8",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: "Success",
            text: "You have successfully converted your currency!",
            icon: "success",
            confirmButtonColor: "#0275d8",
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire({
            title: "Cancelled",
            text: "Your conversion has been cancelled.",
            icon: "success",
            confirmButtonColor: "#0275d8",
          });
        }
      });
    } catch (err) {
      console.error(`Conversion error: ${err}`);
    }
  }

  function swapConversion() {
    setSelectedCurrencyFrom(selectedCurrencyTo);
    setSelectedCurrencyTo(selectedCurrencyFrom);
    amountPay != ""
      ? setAmountReceive(
          swapPriceAmount(amountPay, selectedCurrencyTo.price, selectedCurrencyFrom.price)
        )
      : setAmountReceive("");
  }

  function swapPriceAmount(amount, currPrice1, currPrice2) {
    return (amount / currPrice1) * currPrice2;
  }

  function conversationRate(curr1, curr2, currPrice1, currPrice2) {
    return "1 " + curr1 + " = " + (1 / currPrice1) * currPrice2 + " " + curr2;
  }

  function currentRate(curr) {
    return "1 " + curr.currency + " = $" + curr.price;
  }

  return (
    <div className="h-screen bg-[#e1f4ff] p-3 md:pt-10">
    <div className="max-w-2xl mx-auto border border-[#0aa9ff] rounded-2xl bg-white p-6">
      <h1 className="text-black text-2xl mb-10 text-center font-bold">
        SWAP CURRENCIES
      </h1>
      <form onSubmit={onSubmit}>
        <div className="mx-auto mb-10 md:w-60">
          <div className="flex">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="amountPay"
            >
              Amount (You Pay)
            </label>
          </div>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
            id="amountPay"
            type="Number"
            value={amountPay}
            min={0}
            onChange={(e) => {
              setAmountPay(e.target.value);
              e.target.value != ""
                ? setAmountReceive(
                    swapPriceAmount(
                      e.target.value,
                      selectedCurrencyFrom.price,
                      selectedCurrencyTo.price
                    )
                  )
                : setAmountReceive("");
            }}
            placeholder="Enter Amount"
          />
        </div>

        <div className="flex flex-col mb-6 gap-0 items-center  md:flex-row md:gap-9">
         <IconListBox selectedCurrency={selectedCurrencyFrom} 
         onSelectCurrency={setSelectedCurrencyFrom} 
         allCurrencies={allCurrencies}
         label={"From"}/>
          <div
            onClick={() => swapConversion()}
            className="border-4 border-blue-100 rounded-full p-4 mt-3 cursor-pointer hover:border-blue-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 17"
              aria-hidden="true"
              className="w-4 h-4 text-blue-500 miscellany___StyledIconSwap-sc-1r08bla-1 fZJuOo"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M11.726 1.273l2.387 2.394H.667V5h13.446l-2.386 2.393.94.94 4-4-4-4-.94.94zM.666 12.333l4 4 .94-.94L3.22 13h13.447v-1.333H3.22l2.386-2.394-.94-.94-4 4z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
          <IconListBox selectedCurrency={selectedCurrencyTo} 
          onSelectCurrency={setSelectedCurrencyTo}
          allCurrencies={allCurrencies}
          label={"To"}/>
        </div>
        <div className="mx-auto my-10 md:w-60">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="amountReceive"
          >
            Amount (You Receive)
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
            id="amountReceive"
            type="Number"
            value={amountReceive}
            onChange={(e) => setAmountReceive(e.target.value)}
            placeholder="What you will receive"
            disabled
          />
        </div>

        {amountPay && selectedCurrencyFrom && selectedCurrencyTo &&
          <div className='flex flex-col md:flex-row gap-6 mb-3 border border-1 rounded-lg p-4 bg-slate-50'>
            <div>
            <h1 className="font-bold">Current Rates:</h1>
            <h1>{currentRate(selectedCurrencyFrom)}</h1>
            <h1>{currentRate(selectedCurrencyTo)}</h1>
            </div>
            <div>
            <h1 className="font-bold">Reference Price:</h1>
            <h1>
              {conversationRate(
                selectedCurrencyFrom.currency,
                selectedCurrencyTo.currency,
                selectedCurrencyFrom.price,
                selectedCurrencyTo.price
              )}
            </h1>
            </div>
          </div>
        }

        <div className="text-center">
          <button
            className={
              !amountPay
                ? "no-amount disabled cursor-not-allowed inline-flex justify-center py-3 px-5 border border-transparent shadow-sm text-md font-bold rounded-md text-white bg-gray-300"
                : "inline-flex justify-center py-3 px-5 border border-transparent shadow-sm text-md font-bold rounded-md text-white bg-blue-500 hover:bg-blue-600"
            }
            disabled={!amountPay}
          >
            Convert
          </button>
          {!amountPay ? (
            <Tooltip anchorSelect=".no-amount" place="top">
              Please enter an amount you would like to convert
            </Tooltip>
          ) : null}
        </div>
      </form>
    </div>
    </div>
  );
}