import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedHeader } from '@/components/EnhancedHeader';
import BottomNavigation from '@/components/BottomNavigation';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  ShoppingCart, 
  Package, 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  Search,
  Truck 
} from 'lucide-react';

const Market = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([
    { id: 1, name: 'Milk', price: 50, quantity: 200, unit: 'liter' },
    { id: 2, name: 'Eggs', price: 10, quantity: 500, unit: 'piece' },
    { id: 3, name: 'Meat', price: 200, quantity: 100, unit: 'kg' },
    { id: 4, name: 'Hay', price: 300, quantity: 50, unit: 'bundle' },
  ]);

  const translations = {
    am: {
      title: 'ገበያ',
      subtitle: 'ምርቶችን ይግዙ እና ይሽጡ',
      search: 'ፈልግ...',
      product: 'ምርት',
      price: 'ዋጋ',
      quantity: 'ብዛት',
      unit: 'ዩኒት',
      buy: 'ግዛ',
      sell: 'ሽጥ',
      noProducts: 'ምንም ምርቶች አልተገኙም',
      totalProducts: 'ጠቅላላ ምርቶች',
      availableProducts: 'የሚገኙ ምርቶች',
      averagePrice: 'አማካይ ዋጋ',
      recentOrders: 'የቅርብ ጊዜ ትዕዛዞች',
      orderId: 'ትዕዛዝ ቁጥር',
      date: 'ቀን',
      status: 'ሁኔታ',
      viewDetails: 'ዝርዝሮችን ይመልከቱ',
      shipping: 'ጭነት',
      delivered: 'ተላልፏል',
      pending: 'በሂደት ላይ',
      noOrders: 'ምንም ትዕዛዞች አልተገኙም',
      lowStock: 'ዝቅተኛ ክምችት',
      highDemand: 'ከፍተኛ ፍላጎት',
      marketTrends: 'የገበያ አዝማሚያዎች',
      increase: 'ጨምር',
      decrease: 'ቅነሳ',
      productsSold: 'የተሸጡ ምርቶች',
      revenueGenerated: 'የተገኘ ገቢ',
      customerSatisfaction: 'የደንበኞች እርካታ',
      shippingPartners: 'የጭነት አጋሮች',
      reliableDelivery: 'አስተማማኝ መላኪያ',
      fastShipping: 'ፈጣን መላኪያ',
      customerSupport: 'የደንበኞች ድጋፍ',
      contactUs: 'ያግኙን',
    },
    en: {
      title: 'Market',
      subtitle: 'Buy and sell products',
      search: 'Search...',
      product: 'Product',
      price: 'Price',
      quantity: 'Quantity',
      unit: 'Unit',
      buy: 'Buy',
      sell: 'Sell',
      noProducts: 'No products found',
      totalProducts: 'Total Products',
      availableProducts: 'Available Products',
      averagePrice: 'Average Price',
      recentOrders: 'Recent Orders',
      orderId: 'Order ID',
      date: 'Date',
      status: 'Status',
      viewDetails: 'View Details',
      shipping: 'Shipping',
      delivered: 'Delivered',
      pending: 'Pending',
      noOrders: 'No orders found',
      lowStock: 'Low Stock',
      highDemand: 'High Demand',
      marketTrends: 'Market Trends',
      increase: 'Increase',
      decrease: 'Decrease',
      productsSold: 'Products Sold',
      revenueGenerated: 'Revenue Generated',
      customerSatisfaction: 'Customer Satisfaction',
      shippingPartners: 'Shipping Partners',
      reliableDelivery: 'Reliable Delivery',
      fastShipping: 'Fast Shipping',
      customerSupport: 'Customer Support',
      contactUs: 'Contact Us',
    },
    or: {
      title: 'Gabaa',
      subtitle: 'Oomisha bituu fi gurguruu',
      search: 'Barbaadi...',
      product: 'Oomisha',
      price: 'Gatii',
      quantity: 'Baay\'ina',
      unit: 'Yuunitii',
      buy: 'Bituu',
      sell: 'Gurguruu',
      noProducts: 'Oomishni hin argamne',
      totalProducts: 'Oomisha Waliigalaa',
      availableProducts: 'Oomisha Argamu',
      averagePrice: 'Gatii Giddugaleessaa',
      recentOrders: 'Ajaja Dhihoo',
      orderId: 'Lakkoofsa Ajaja',
      date: 'Guyyaa',
      status: 'Haala',
      viewDetails: 'Bal\'inaan Ilaaluu',
      shipping: 'Ergaa',
      delivered: 'Ergameera',
      pending: 'Eeggamaa',
      noOrders: 'Ajajni hin argamne',
      lowStock: 'Qabeenya Xiqqaa',
      highDemand: 'Gaaffii Ol\'aanaa',
      marketTrends: 'Haala Gabaa',
      increase: 'Dabalata',
      decrease: 'Hir\'ina',
      productsSold: 'Oomisha Gurgurame',
      revenueGenerated: 'Galii Argame',
      customerSatisfaction: 'Madaallii Gammachuu',
      shippingPartners: 'Michuu Ergaa',
      reliableDelivery: 'Ergaa Amanamaa',
      fastShipping: 'Ergaa Ariifachiisaa',
      customerSupport: 'Deeggarsa Maamilaa',
      contactUs: 'Nu Quunnamaa',
    },
    sw: {
      title: 'Soko',
      subtitle: 'Nunua na uza bidhaa',
      search: 'Tafuta...',
      product: 'Bidhaa',
      price: 'Bei',
      quantity: 'Kiasi',
      unit: 'Kitengo',
      buy: 'Nunua',
      sell: 'Uza',
      noProducts: 'Hakuna bidhaa zilizopatikana',
      totalProducts: 'Jumla ya Bidhaa',
      availableProducts: 'Bidhaa Zinazopatikana',
      averagePrice: 'Bei ya Wastani',
      recentOrders: 'Maagizo ya Hivi Karibuni',
      orderId: 'Kitambulisho cha Agizo',
      date: 'Tarehe',
      status: 'Hali',
      viewDetails: 'Angalia Maelezo',
      shipping: 'Usafirishaji',
      delivered: 'Imewasilishwa',
      pending: 'Inasubiri',
      noOrders: 'Hakuna maagizo yaliyopatikana',
      lowStock: 'Hisa Chini',
      highDemand: 'Mahitaji Makubwa',
      marketTrends: 'Mielekeo ya Soko',
      increase: 'Ongezeko',
      decrease: 'Punguzo',
      productsSold: 'Bidhaa Zilizouzwa',
      revenueGenerated: 'Mapato Yaliyotokana',
      customerSatisfaction: 'Kuridhika kwa Wateja',
      shippingPartners: 'Washirika wa Usafirishaji',
      reliableDelivery: 'Uwasilishaji wa Kuaminika',
      fastShipping: 'Usafirishaji wa Haraka',
      customerSupport: 'Msaada wa Wateja',
      contactUs: 'Wasiliana Nasi',
    },
  };

  const t = translations[language];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalProducts = products.reduce((acc, product) => acc + product.quantity, 0);
  const availableProducts = products.filter(product => product.quantity > 0).length;
  const averagePrice = products.reduce((acc, product) => acc + product.price, 0) / products.length;

  const recentOrders = [
    { id: 101, date: '2024-06-05', status: 'delivered' },
    { id: 102, date: '2024-06-04', status: 'shipping' },
    { id: 103, date: '2024-06-03', status: 'pending' },
  ];

  const marketTrends = [
    { product: 'Milk', trend: 'increase', percentage: 10 },
    { product: 'Eggs', trend: 'decrease', percentage: 5 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 pb-16 sm:pb-20 lg:pb-24">
      <EnhancedHeader />
      <OfflineIndicator language={language} />

      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 space-y-3 sm:space-y-4 lg:space-y-6">
        {/* Page Title */}
        <div className="text-center px-2">
          <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            <ShoppingCart className="inline-block w-6 h-6 mr-2 align-middle" />
            {t.title}
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
            {t.subtitle}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <Input
            type="text"
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md py-2 px-3 text-sm text-gray-700 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Market Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-sm font-medium">{t.totalProducts}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-sm font-medium">{t.availableProducts}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableProducts}</div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-sm font-medium">{t.averagePrice}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averagePrice.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardHeader>
              <CardTitle className="text-sm font-medium">{t.lowStock}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
            </CardContent>
          </Card>
        </div>

        {/* Product List */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">{t.product}</TableHead>
                <TableHead className="text-left">{t.price}</TableHead>
                <TableHead className="text-left">{t.quantity}</TableHead>
                <TableHead className="text-left">{t.unit}</TableHead>
                <TableHead className="text-left"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.price}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>{product.unit}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">{t.buy}</Button>
                      <Button variant="secondary" size="sm">{t.sell}</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">{t.noProducts}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Recent Orders */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t.recentOrders}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left">{t.orderId}</TableHead>
                  <TableHead className="text-left">{t.date}</TableHead>
                  <TableHead className="text-left">{t.status}</TableHead>
                  <TableHead className="text-left"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length > 0 ? (
                  recentOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>{t[order.status]}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">{t.viewDetails}</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">{t.noOrders}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Market Trends */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t.marketTrends}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {marketTrends.map(trend => (
                <li key={trend.product} className="flex items-center justify-between py-2">
                  <span>{trend.product}</span>
                  <div className="flex items-center">
                    {trend.trend === 'increase' ? (
                      <TrendingUp className="text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="text-red-500 mr-1" />
                    )}
                    <span>{trend.percentage}% {t[trend.trend]}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation language={language} />
    </div>
  );
};

export default Market;
