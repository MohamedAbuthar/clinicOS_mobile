import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';

interface PaginationComponentProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onDoublePageChange: (direction: 'prev' | 'next') => void;
}

export const PaginationComponent: React.FC<PaginationComponentProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onDoublePageChange,
}) => {
  // Get paginated appointments
  const getPaginatedAppointments = (appointments: any[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return appointments.slice(startIndex, endIndex);
  };

  // Get total pages
  const getTotalPages = (appointments: any[]) => {
    return Math.ceil(appointments.length / itemsPerPage);
  };

  // Show pagination only if there are more items than itemsPerPage
  if (totalItems <= itemsPerPage) {
    return null;
  }

  return (
    <View style={styles.paginationContainer}>
      <View style={styles.paginationInfo}>
        <ThemedText style={styles.paginationText}>
          {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
        </ThemedText>
      </View>
      
      <View style={styles.paginationControls}>
        <View style={styles.paginationLeftButtons}>
          <TouchableOpacity
            style={[styles.paginationButton, styles.doubleArrowButton, currentPage <= 2 && styles.paginationButtonDisabled]}
            onPress={() => onDoublePageChange('prev')}
            disabled={currentPage <= 2}
          >
            <ThemedText style={[styles.paginationButtonText, styles.doubleArrowText, currentPage <= 2 && styles.paginationButtonTextDisabled]}>
              ≪
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
            onPress={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ThemedText style={[styles.paginationButtonText, currentPage === 1 && styles.paginationButtonTextDisabled]}>
              ‹
            </ThemedText>
          </TouchableOpacity>
        </View>
        
        <View style={styles.pageNumbers}>
          {(() => {
            const pages = [];
            
            // Show current page and adjacent pages (max 3 buttons)
            if (currentPage <= 3) {
              // For pages 1-3, show 1, 2, 3
              for (let i = 1; i <= Math.min(3, totalPages); i++) {
                pages.push(i);
              }
            } else {
              // For pages 4+, show current page and 2 adjacent pages
              const start = Math.max(1, currentPage - 1);
              const end = Math.min(totalPages, currentPage + 1);
              
              for (let i = start; i <= end; i++) {
                pages.push(i);
              }
            }
            
            return pages.map((page) => (
              <TouchableOpacity
                key={page}
                style={[styles.pageNumber, currentPage === page && styles.pageNumberActive]}
                onPress={() => onPageChange(page)}
              >
                <ThemedText style={[styles.pageNumberText, currentPage === page && styles.pageNumberTextActive]}>
                  {page}
                </ThemedText>
              </TouchableOpacity>
            ));
          })()}
        </View>
        
        <View style={styles.paginationRightButtons}>
          <TouchableOpacity
            style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
            onPress={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ThemedText style={[styles.paginationButtonText, currentPage === totalPages && styles.paginationButtonTextDisabled]}>
              ›
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.paginationButton, styles.doubleArrowButton, currentPage >= totalPages - 1 && styles.paginationButtonDisabled]}
            onPress={() => onDoublePageChange('next')}
            disabled={currentPage >= totalPages - 1}
          >
            <ThemedText style={[styles.paginationButtonText, styles.doubleArrowText, currentPage >= totalPages - 1 && styles.paginationButtonTextDisabled]}>
              ≫
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  paginationContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paginationInfo: {
    alignItems: 'center',
    marginBottom: 12,
  },
  paginationText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  paginationLeftButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  paginationRightButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  paginationButton: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
  },
  paginationButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  paginationButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  paginationButtonTextDisabled: {
    color: '#9CA3AF',
  },
  doubleArrowButton: {
    backgroundColor: '#14B8A6',
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
  },
  doubleArrowText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
    color: '#FFFFFF',
  },
  pageNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  pageNumber: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pageNumberActive: {
    backgroundColor: '#14B8A6',
    borderColor: '#14B8A6',
  },
  pageNumberText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  pageNumberTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
