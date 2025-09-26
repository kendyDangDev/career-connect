import { ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function TopConnectScreen() {
  const colorScheme = useColorScheme();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>Top Connect</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Tìm kiếm công việc và kết nối với nhà tuyển dụng
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        {/* Search Bar */}
        <ThemedView style={styles.searchContainer}>
          <IconSymbol size={20} name="magnifyingglass" color={Colors[colorScheme ?? 'light'].icon} />
          <TextInput
            style={[styles.searchInput, { color: Colors[colorScheme ?? 'light'].text }]}
            placeholder="Tìm kiếm công việc, công ty..."
            placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </ThemedView>

        {/* Quick Filters */}
        <ThemedView style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={styles.filterChip}>
              <ThemedText style={styles.filterText}>React Native</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
              <ThemedText style={styles.filterText}>Node.js</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
              <ThemedText style={styles.filterText}>Remote</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
              <ThemedText style={styles.filterText}>Hồ Chí Minh</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </ThemedView>

        {/* Top Companies */}
        <ThemedView style={styles.sectionContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Top Công Ty</ThemedText>
          
          <TouchableOpacity style={styles.companyCard}>
            <ThemedView style={styles.companyLogo}>
              <ThemedText style={styles.companyLogoText}>FPT</ThemedText>
            </ThemedView>
            <ThemedView style={styles.companyInfo}>
              <ThemedText type="defaultSemiBold">FPT Software</ThemedText>
              <ThemedText style={styles.companySubtext}>120 vị trí đang tuyển</ThemedText>
              <ThemedText style={styles.companyLocation}>Hồ Chí Minh, Hà Nội</ThemedText>
            </ThemedView>
            <IconSymbol size={16} name="chevron.right" color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.companyCard}>
            <ThemedView style={styles.companyLogo}>
              <ThemedText style={styles.companyLogoText}>VNG</ThemedText>
            </ThemedView>
            <ThemedView style={styles.companyInfo}>
              <ThemedText type="defaultSemiBold">VNG Corporation</ThemedText>
              <ThemedText style={styles.companySubtext}>85 vị trí đang tuyển</ThemedText>
              <ThemedText style={styles.companyLocation}>Hồ Chí Minh</ThemedText>
            </ThemedView>
            <IconSymbol size={16} name="chevron.right" color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>
        </ThemedView>

        {/* Featured Jobs */}
        <ThemedView style={styles.sectionContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Việc Làm Nổi Bật</ThemedText>
          
          <TouchableOpacity style={styles.jobCard}>
            <ThemedView style={styles.jobHeader}>
              <ThemedView style={styles.jobCompanyLogo}>
                <ThemedText style={styles.jobCompanyLogoText}>T</ThemedText>
              </ThemedView>
              <ThemedView style={styles.jobInfo}>
                <ThemedText type="defaultSemiBold">React Native Developer</ThemedText>
                <ThemedText style={styles.jobCompany}>Tiki Corporation</ThemedText>
                <ThemedText style={styles.jobSalary}>20-30 triệu VNĐ</ThemedText>
              </ThemedView>
              <TouchableOpacity style={styles.bookmarkButton}>
                <IconSymbol size={20} name="bookmark" color={Colors[colorScheme ?? 'light'].icon} />
              </TouchableOpacity>
            </ThemedView>
            <ThemedView style={styles.jobTags}>
              <ThemedView style={styles.tag}>
                <ThemedText style={styles.tagText}>React Native</ThemedText>
              </ThemedView>
              <ThemedView style={styles.tag}>
                <ThemedText style={styles.tagText}>3+ năm</ThemedText>
              </ThemedView>
              <ThemedView style={styles.tag}>
                <ThemedText style={styles.tagText}>Remote</ThemedText>
              </ThemedView>
            </ThemedView>
          </TouchableOpacity>

          <TouchableOpacity style={styles.jobCard}>
            <ThemedView style={styles.jobHeader}>
              <ThemedView style={styles.jobCompanyLogo}>
                <ThemedText style={styles.jobCompanyLogoText}>S</ThemedText>
              </ThemedView>
              <ThemedView style={styles.jobInfo}>
                <ThemedText type="defaultSemiBold">Frontend Developer</ThemedText>
                <ThemedText style={styles.jobCompany}>Shopee Vietnam</ThemedText>
                <ThemedText style={styles.jobSalary}>25-35 triệu VNĐ</ThemedText>
              </ThemedView>
              <TouchableOpacity style={styles.bookmarkButton}>
                <IconSymbol size={20} name="bookmark" color={Colors[colorScheme ?? 'light'].icon} />
              </TouchableOpacity>
            </ThemedView>
            <ThemedView style={styles.jobTags}>
              <ThemedView style={styles.tag}>
                <ThemedText style={styles.tagText}>React</ThemedText>
              </ThemedView>
              <ThemedView style={styles.tag}>
                <ThemedText style={styles.tagText}>2+ năm</ThemedText>
              </ThemedView>
              <ThemedView style={styles.tag}>
                <ThemedText style={styles.tagText}>HCM</ThemedText>
              </ThemedView>
            </ThemedView>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  headerTitle: {
    marginBottom: 8,
  },
  headerSubtitle: {
    opacity: 0.7,
  },
  content: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filtersContainer: {
    marginBottom: 24,
  },
  filterChip: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  companyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    marginBottom: 12,
  },
  companyLogo: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyLogoText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  companyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  companySubtext: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  companyLocation: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  jobCard: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    marginBottom: 12,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobCompanyLogo: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobCompanyLogoText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  jobInfo: {
    flex: 1,
    marginLeft: 12,
  },
  jobCompany: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  jobSalary: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  bookmarkButton: {
    padding: 4,
  },
  jobTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
  },
});
