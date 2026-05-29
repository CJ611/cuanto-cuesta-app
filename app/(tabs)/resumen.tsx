import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useAuth } from '../../src/hooks/useAuth';
import { facturasService } from '../../src/services/facturasService';
import { Factura } from '../../src/types';
import { colors, spacing } from '../../src/utils/theme';

export default function ResumenScreen() {
  const { user } = useAuth();
  const [salesData, setSalesData] = useState<{ date: string; total: number }[]>([]);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.tienda_id) return;
    try {
      const [sales, facturasData] = await Promise.all([
        facturasService.getWeeklySales(user.tienda_id),
        facturasService.getByTienda(user.tienda_id),
      ]);
      setSalesData(sales);
      setFacturas(facturasData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user?.tienda_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalSemanal = salesData.reduce((sum, day) => sum + day.total, 0);
  const maxSale = Math.max(...salesData.map((d) => d.total), 1);

  // Contar facturas de los últimos 7 días
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const facturasSemanales = facturas.filter(
    (f) => new Date(f.created_at) >= sevenDaysAgo
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resumen de Ventas</Text>
        <Text style={styles.headerSubtitle}>Últimos 7 días</Text>
      </View>

      {/* Gráfico de barras simple */}
      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          {salesData.map((day, index) => (
            <View key={index} style={styles.barContainer}>
              <Text style={styles.barValue}>
                {day.total > 0 ? `$${(day.total / 1000).toFixed(0)}k` : ''}
              </Text>
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max((day.total / maxSale) * 120, 4),
                    backgroundColor: day.total > 0 ? colors.secondary : colors.border,
                  },
                ]}
              />
              <Text style={styles.barLabel}>{day.date}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Cards de resumen */}
      <View style={styles.summaryCards}>
        <Card style={styles.summaryCard}>
          <Card.Content style={styles.summaryContent}>
            <Text style={styles.summaryLabel}>Total Semanal</Text>
            <Text style={styles.summaryValue}>${totalSemanal.toLocaleString()}</Text>
          </Card.Content>
        </Card>
        <Card style={styles.summaryCard}>
          <Card.Content style={styles.summaryContent}>
            <Text style={styles.summaryLabel}>Facturas Emitidas</Text>
            <Text style={styles.summaryValue}>{facturasSemanales.length}</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Últimas facturas */}
      <View style={styles.recentSection}>
        <Text style={styles.recentTitle}>Últimas Facturas</Text>
        {facturas.slice(0, 5).map((factura) => (
          <View key={factura.id} style={styles.recentItem}>
            <View>
              <Text style={styles.recentId}>#{factura.id.substring(0, 8).toUpperCase()}</Text>
              <Text style={styles.recentDate}>
                {new Date(factura.created_at).toLocaleDateString('es-CO')}
              </Text>
            </View>
            <Text style={styles.recentTotal}>${Number(factura.total).toLocaleString()}</Text>
          </View>
        ))}
        {facturas.length === 0 && (
          <Text style={styles.emptyText}>No hay facturas aún</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingTop: 50,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textWhite,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.secondary,
    marginTop: spacing.xs,
  },
  chartContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingTop: spacing.md,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 24,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  barValue: {
    fontSize: 9,
    color: colors.textWhite,
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 11,
    color: colors.textWhite,
    opacity: 0.7,
  },
  summaryCards: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  summaryContent: {
    alignItems: 'center',
    padding: spacing.md,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  recentSection: {
    padding: spacing.md,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  recentId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  recentDate: {
    fontSize: 12,
    color: colors.textLight,
  },
  recentTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.teal,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textLight,
    marginTop: spacing.lg,
  },
});
