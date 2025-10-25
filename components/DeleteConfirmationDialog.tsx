import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';
import { ThemedText } from './themed-text';

// Custom SVG Components
const X = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke="#6B7280"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const AlertTriangle = () => (
  <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
    <Path
      d="M10.29 3.86L1.82 18C1.64547 18.3024 1.5729 18.6453 1.61211 18.9873C1.65132 19.3292 1.80046 19.6528 2.03512 19.9045C2.26979 20.1562 2.57796 20.3231 2.91342 20.3818C3.24888 20.4405 3.5957 20.3885 3.9 20.23L12 16.77L20.1 20.23C20.4043 20.3885 20.7511 20.4405 21.0866 20.3818C21.422 20.3231 21.7302 20.1562 21.9649 19.9045C22.1995 19.6528 22.3487 19.3292 22.3879 18.9873C22.4271 18.6453 22.3545 18.3024 22.18 18L13.71 3.86C13.5318 3.56631 13.2807 3.32312 12.9812 3.15447C12.6817 2.98582 12.3438 2.89725 12 2.89725C11.6562 2.89725 11.3183 2.98582 11.0188 3.15447C10.7193 3.32312 10.4682 3.56631 10.29 3.86Z"
      stroke="#F59E0B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 9V13"
      stroke="#F59E0B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 17H12.01"
      stroke="#F59E0B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Trash2 = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 6H5H21"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 11V17"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 11V17"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  isLoading?: boolean;
}

export function DeleteConfirmationDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  itemName, 
  isLoading = false 
}: DeleteConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <AlertTriangle />
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <ThemedText style={styles.title}>{title}</ThemedText>
            <ThemedText style={styles.message}>{message}</ThemedText>
            {itemName && (
              <View style={styles.itemContainer}>
                <ThemedText style={styles.itemLabel}>Assistant:</ThemedText>
                <ThemedText style={styles.itemName}>{itemName}</ThemedText>
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
              disabled={isLoading}
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.deleteButton, isLoading && styles.deleteButtonDisabled]} 
              onPress={onConfirm}
              disabled={isLoading}
            >
              <Trash2 />
              <ThemedText style={styles.deleteButtonText}>
                {isLoading ? 'Deleting...' : 'Delete Assistant'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  itemContainer: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    minHeight: 44,
  },
  deleteButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});