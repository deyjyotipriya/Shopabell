import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>ShopAbell - Transform Your Live Selling Business</title>
        {/* The main metadata is in layout.tsx, but this is for page-specific adjustments if needed */}
      </Head>
      <main>
        <section className="min-h-screen flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
          <h1 className="text-hero font-bold bg-gradient-to-r from-primary-purple to-secondary-pink bg-clip-text text-transparent mb-6">
            Transform Your Live Selling Business
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-8">
            The all-in-one platform that helps social media sellers turn live streams into sales.
          </p>
          <button className="bg-primary-purple hover:bg-secondary-pink text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1">
            Try Demo Dashboard
          </button>
        </section>

        <section className="py-16 sm:py-20 lg:py-24 bg-background-light">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-h2 font-bold text-text-primary text-center mb-12 sm:mb-16">
              Key Features for Your Success
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature Card 1 */}
              <div className="bg-background-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out flex flex-col items-center text-center md:items-start md:text-left">
                <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-5">
                  <svg className="w-8 h-8 text-primary-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.46 4.4a1 1 0 01-.544 1.304l-1.534.852a11.024 11.024 0 006.364 6.364l.852-1.533a1 1 0 011.304-.544l4.4 1.46a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </div>
                <h3 className="text-h3 font-semibold text-text-primary mb-2">WhatsApp Onboarding</h3>
                <p className="text-body text-text-secondary">
                  Get your store ready in 30 seconds directly via WhatsApp.
                </p>
              </div>

              {/* Feature Card 2 */}
              <div className="bg-background-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out flex flex-col items-center text-center md:items-start md:text-left">
                <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-5">
                  <svg className="w-8 h-8 text-primary-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 className="text-h3 font-semibold text-text-primary mb-2">AI Livestream Catalog</h3>
                <p className="text-body text-text-secondary">
                  Automatically convert your live videos into product catalogs using AI.
                </p>
              </div>

              {/* Feature Card 3 */}
              <div className="bg-background-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out flex flex-col items-center text-center md:items-start md:text-left">
                <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-5">
                  <svg className="w-8 h-8 text-primary-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                  </svg>
                </div>
                <h3 className="text-h3 font-semibold text-text-primary mb-2">Universal Payments</h3>
                <p className="text-body text-text-secondary">
                  Accept UPI, cards, wallets, bank transfers, and COD effortlessly.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 lg:py-24 bg-background-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-h2 font-bold text-text-primary text-center mb-12 sm:mb-16">
              Simple, Transparent Pricing
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
              {/* Free Plan Card */}
              <div className="bg-background-white rounded-lg shadow-xl p-6 flex flex-col">
                <h3 className="text-xl font-semibold text-text-primary mb-1 text-center">Free</h3>
                <p className="text-4xl font-bold text-primary-purple mb-4 text-center">
                  ₹0
                </p>
                <ul className="space-y-2 mb-6 text-text-secondary flex-grow">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-success-green mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    50 products
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-success-green mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    100 orders/month
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-success-green mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    Basic analytics
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-success-green mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    WhatsApp Onboarding
                  </li>
                </ul>
                <button className="w-full py-3 rounded-lg font-semibold transition duration-300 bg-purple-100 text-primary-purple hover:bg-purple-200">
                  Get Started
                </button>
              </div>

              {/* Standard Plan Card (Popular) */}
              <div className="bg-background-white rounded-lg shadow-xl p-6 flex flex-col border-2 border-primary-purple relative">
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-secondary-pink text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">POPULAR</div>
                <h3 className="text-xl font-semibold text-text-primary mb-1 text-center">Standard</h3>
                <p className="text-4xl font-bold text-primary-purple mb-4 text-center">
                  ₹500<span className="text-sm font-normal text-text-secondary">/month</span>
                </p>
                <ul className="space-y-2 mb-6 text-text-secondary flex-grow">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-success-green mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    200 products
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-success-green mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    500 orders/month
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-success-green mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    Advanced analytics
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-success-green mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    AI Livestream Catalog
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-success-green mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    Priority Email Support
                  </li>
                </ul>
                <button className="w-full py-3 rounded-lg font-semibold transition duration-300 bg-primary-purple text-white hover:bg-opacity-90">
                  Choose Standard
                </button>
              </div>

              {/* Premium Plan Card */}
              <div className="bg-background-white rounded-lg shadow-xl p-6 flex flex-col">
                <h3 className="text-xl font-semibold text-text-primary mb-1 text-center">Premium</h3>
                <p className="text-4xl font-bold text-primary-purple mb-4 text-center">
                  ₹1000<span className="text-sm font-normal text-text-secondary">/month</span>
                </p>
                <ul className="space-y-2 mb-6 text-text-secondary flex-grow">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-success-green mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    Unlimited products
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-success-green mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    Unlimited orders
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-success-green mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    Premium analytics
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-success-green mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    All Features Included
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-success-green mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                    Dedicated Support Agent
                  </li>
                </ul>
                <button className="w-full py-3 rounded-lg font-semibold transition duration-300 bg-purple-100 text-primary-purple hover:bg-purple-200">
                  Choose Premium
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
