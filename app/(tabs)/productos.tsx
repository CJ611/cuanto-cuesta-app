import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Text, TextInput, Button, Chip } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { productosService } from '../../src/services/productosService';
import { colors, spacing } from '../../src/utils/theme';

const CATEGORIAS = ['Alimentos', 'Bebidas', 'Limpieza', 'Cuidado Personal', 'Otros'];

export default function ProductosScreen() {
  const { user } = useAuth();
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async (source: 'camera' | 'gallery') => {
    let result;

    if (source === 'camera') {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permiso requerido', 'Se necesita acceso a la cámara');
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
    } else {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permiso requerido', 'Se necesita acceso a la galería');
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
    }

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCreate = async () => {
    if (!nombre || !precio || !categoria) {
      Alert.alert('Error', 'Nombre, precio y categoría son obligatorios');
      return;
    }

    if (!user?.tienda_id) return;

    setLoading(true);

    try {
      let imagen_url: string | null = null;

      if (imageUri) {
        imagen_url = await productosService.uploadImage(imageUri, `producto_${Date.now()}.jpg`);
      }

      await productosService.create({
        nombre,
        precio: parseFloat(precio),
        categoria: categoria as any,
        descripcion: descripcion || null,
        imagen_url,
        tienda_id: user.tienda_id,
      });

      Alert.alert('Éxito', 'Producto creado correctamente');
      // Reset form
      setNombre('');
      setPrecio('');
      setCategoria('');
      setDescripcion('');
      setImageUri(null);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo crear el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Agregar Producto</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Imagen */}
        <View style={styles.imageSection}>
          <Text style={styles.label}>Imagen del Producto</Text>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={48} color={colors.textLight} />
            </View>
          )}
          <View style={styles.imageButtons}>
            <Button
              mode="contained"
              icon="camera"
              onPress={() => pickImage('camera')}
              style={styles.imageButton}
              buttonColor={colors.secondary}
              compact
            >
              Cámara
            </Button>
            <Button
              mode="contained"
              icon="image"
              onPress={() => pickImage('gallery')}
              style={styles.imageButton}
              buttonColor={colors.secondary}
              compact
            >
              Galería
            </Button>
          </View>
        </View>

        {/* Formulario */}
        <TextInput
          label="Nombre del Producto *"
          value={nombre}
          onChangeText={setNombre}
          mode="outlined"
          placeholder="Ej. Café Premium 500g"
          style={styles.input}
        />

        <TextInput
          label="Precio ($) *"
          value={precio}
          onChangeText={setPrecio}
          mode="outlined"
          keyboardType="decimal-pad"
          placeholder="0.00"
          style={styles.input}
        />

        <Text style={styles.label}>Categoría</Text>
        <View style={styles.categorias}>
          {CATEGORIAS.map((cat) => (
            <Chip
              key={cat}
              selected={categoria === cat}
              onPress={() => setCategoria(cat)}
              style={[styles.chip, categoria === cat && styles.chipActive]}
              textStyle={categoria === cat ? styles.chipTextActive : styles.chipText}
            >
              {cat}
            </Chip>
          ))}
        </View>

        <TextInput
          label="Descripción (opcional)"
          value={descripcion}
          onChangeText={setDescripcion}
          mode="outlined"
          multiline
          numberOfLines={3}
          placeholder="Describe el producto..."
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleCreate}
          loading={loading}
          disabled={loading}
          style={styles.createButton}
          buttonColor={colors.secondary}
        >
          Crear Producto
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingTop: 50,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textWhite,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  imageSection: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  previewImage: {
    width: 150,
    height: 150,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 12,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  imageButton: {
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
  },
  categorias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.secondary,
  },
  chipText: {
    color: colors.text,
  },
  chipTextActive: {
    color: colors.textWhite,
  },
  createButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
});
