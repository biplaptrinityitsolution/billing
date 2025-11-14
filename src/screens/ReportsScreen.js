import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { VictoryBar, VictoryPie, VictoryChart, VictoryTheme } from 'victory-native';
import { SalesContext } from '../context/SalesContext';

export default function ReportsScreen() {
  const { sales } = useContext(SalesContext);

  // Flatten items from all sales for charts
  const productData = {};
  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      if (!productData[item.name]) {
        productData[item.name] = { qty: 0, amount: 0 };
      }
      productData[item.name].qty += item.qty;
      productData[item.name].amount += item.price * item.qty;
    });
  });

  const chartData = Object.keys(productData).map((key) => ({
    name: key,
    qty: productData[key].qty,
    amount: productData[key].amount,
  }));

  const totalSales = chartData.reduce((sum, p) => sum + p.amount, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Sales Reports</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Total Sales</Text>
        <Text style={styles.value}>₹{totalSales}</Text>
      </View>

      {chartData.length > 0 ? (
        <>
          <Text style={styles.chartTitle}>Sales by Product</Text>
          <VictoryChart theme={VictoryTheme.material} domainPadding={20}>
            <VictoryBar data={chartData} x="name" y="amount" style={{ data: { fill: "#0052cc" } }} />
          </VictoryChart>

          <Text style={styles.chartTitle}>Quantity Distribution</Text>
          <VictoryPie
            data={chartData}
            x="name"
            y="qty"
            colorScale={["#0052cc", "#28a745", "#ff9800", "#e91e63"]}
            innerRadius={50}
            labels={({ datum }) => `${datum.name}\n${datum.qty}`}
            style={{ labels: { fill: "white", fontSize: 12, fontWeight: "bold" } }}
          />
        </>
      ) : (
        <Text>No sales yet. Do a checkout first.</Text>
      )}

      <Text style={styles.chartTitle}>Recent Sales</Text>
      <FlatList
        data={sales}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.listText}>{item.date}</Text>
            <Text style={styles.listText}>₹{item.totalAmount}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#0052cc' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 3 },
  label: { fontSize: 16, color: 'gray' },
  value: { fontSize: 20, fontWeight: 'bold', marginTop: 5 },
  chartTitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 10 },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  listText: { fontSize: 14, fontWeight: '500' },
});
