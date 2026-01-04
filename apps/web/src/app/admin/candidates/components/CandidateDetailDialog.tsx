'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Clock,
  DollarSign,
  Globe,
  Github,
  Linkedin,
  Link,
  GraduationCap,
  Award,
  Building,
  Star,
  FileText,
  Download,
  Loader2,
  User,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  Candidate,
  CandidateListItem,
  availabilityStatusLabels,
  availabilityStatusColors,
  preferredWorkTypeLabels,
  preferredLocationTypeLabels,
  proficiencyLevelLabels,
  degreeTypeLabels,
  employmentTypeLabels,
  userStatusLabels,
  userStatusColors,
} from '../types';

interface CandidateDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateId?: string;
  fetchCandidateDetails?: (id: string) => Promise<Candidate | null>;
}

export const CandidateDetailDialog: React.FC<CandidateDetailDialogProps> = ({
  open,
  onOpenChange,
  candidateId,
  fetchCandidateDetails,
}) => {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (open && candidateId && fetchCandidateDetails) {
      setLoading(true);
      fetchCandidateDetails(candidateId).then((data) => {
        setCandidate(data);
        setLoading(false);
      });
    }
  }, [open, candidateId, fetchCandidateDetails]);

  if (!open) return null;

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  };

  const formatSalary = (min?: number | null, max?: number | null, currency?: string) => {
    if (!min && !max) return 'Không xác định';
    const curr = currency || 'VND';
    if (min && max) {
      return `${min.toLocaleString('vi-VN')} - ${max.toLocaleString('vi-VN')} ${curr}`;
    }
    if (min) return `Từ ${min.toLocaleString('vi-VN')} ${curr}`;
    if (max) return `Đến ${max.toLocaleString('vi-VN')} ${curr}`;
    return 'Không xác định';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl">
        <DialogHeader>
          <DialogTitle>Chi tiết ứng viên</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        ) : candidate ? (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={candidate.avatarUrl || undefined} />
                <AvatarFallback>
                  {getInitials(candidate.firstName, candidate.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold">
                      {candidate.firstName} {candidate.lastName}
                    </h3>
                    <p className="text-muted-foreground">
                      {candidate.candidateInfo?.currentPosition || 'Chưa cập nhật vị trí'}
                    </p>
                    <div className="mt-2 flex items-center gap-4">
                      <Badge variant={userStatusColors[candidate.status]}>
                        {userStatusLabels[candidate.status]}
                      </Badge>
                      {candidate.candidateInfo?.availabilityStatus && (
                        <Badge
                          variant={
                            availabilityStatusColors[candidate.candidateInfo.availabilityStatus]
                          }
                        >
                          {availabilityStatusLabels[candidate.candidateInfo.availabilityStatus]}
                        </Badge>
                      )}
                      <div className="text-muted-foreground flex items-center gap-1 text-sm">
                        {candidate.emailVerified ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        Email {candidate.emailVerified ? 'đã xác thực' : 'chưa xác thực'}
                      </div>
                    </div>
                  </div>
                  {/* <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Tải CV
                  </Button> */}
                </div>
              </div>
            </div>

            <Separator />

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                <TabsTrigger value="experience">Kinh nghiệm</TabsTrigger>
                <TabsTrigger value="education">Học vấn</TabsTrigger>
                <TabsTrigger value="skills">Kỹ năng</TabsTrigger>
                <TabsTrigger value="certifications">Chứng chỉ</TabsTrigger>
              </TabsList>

              <ScrollArea className="mt-4 h-[320px]">
                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                  {/* Contact Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Thông tin liên hệ</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="text-muted-foreground h-4 w-4" />
                        <span>{candidate.email}</span>
                      </div>
                      {candidate.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="text-muted-foreground h-4 w-4" />
                          <span>{candidate.phone}</span>
                        </div>
                      )}
                      {candidate.profile?.city && (
                        <div className="flex items-center gap-3">
                          <MapPin className="text-muted-foreground h-4 w-4" />
                          <span>
                            {[
                              candidate.profile.address,
                              candidate.profile.city,
                              candidate.profile.province,
                              candidate.profile.country,
                            ]
                              .filter(Boolean)
                              .join(', ')}
                          </span>
                        </div>
                      )}
                      {candidate.profile?.dateOfBirth && (
                        <div className="flex items-center gap-3">
                          <Calendar className="text-muted-foreground h-4 w-4" />
                          <span>
                            {format(new Date(candidate.profile.dateOfBirth), 'dd/MM/yyyy', {
                              locale: vi,
                            })}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Work Preferences */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Mong muốn công việc</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {candidate.candidateInfo?.experienceYears !== undefined && (
                        <div className="flex items-center gap-3">
                          <Briefcase className="text-muted-foreground h-4 w-4" />
                          <span>Kinh nghiệm: {candidate.candidateInfo.experienceYears} năm</span>
                        </div>
                      )}
                      {candidate.candidateInfo?.preferredWorkType && (
                        <div className="flex items-center gap-3">
                          <Clock className="text-muted-foreground h-4 w-4" />
                          <span>
                            Loại hình:{' '}
                            {preferredWorkTypeLabels[candidate.candidateInfo.preferredWorkType]}
                          </span>
                        </div>
                      )}
                      {candidate.candidateInfo?.preferredLocationType && (
                        <div className="flex items-center gap-3">
                          <MapPin className="text-muted-foreground h-4 w-4" />
                          <span>
                            Nơi làm việc:{' '}
                            {
                              preferredLocationTypeLabels[
                                candidate.candidateInfo.preferredLocationType
                              ]
                            }
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <DollarSign className="text-muted-foreground h-4 w-4" />
                        <span>
                          Mức lương mong muốn:{' '}
                          {formatSalary(
                            candidate.candidateInfo?.expectedSalaryMin,
                            candidate.candidateInfo?.expectedSalaryMax,
                            candidate.candidateInfo?.currency
                          )}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Social Links */}
                  {(candidate.profile?.websiteUrl ||
                    candidate.profile?.linkedinUrl ||
                    candidate.profile?.githubUrl ||
                    candidate.profile?.portfolioUrl) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Liên kết</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {candidate.profile.websiteUrl && (
                          <div className="flex items-center gap-3">
                            <Globe className="text-muted-foreground h-4 w-4" />
                            <a
                              href={candidate.profile.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {candidate.profile.websiteUrl}
                            </a>
                          </div>
                        )}
                        {candidate.profile.linkedinUrl && (
                          <div className="flex items-center gap-3">
                            <Linkedin className="text-muted-foreground h-4 w-4" />
                            <a
                              href={candidate.profile.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              LinkedIn Profile
                            </a>
                          </div>
                        )}
                        {candidate.profile.githubUrl && (
                          <div className="flex items-center gap-3">
                            <Github className="text-muted-foreground h-4 w-4" />
                            <a
                              href={candidate.profile.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              GitHub Profile
                            </a>
                          </div>
                        )}
                        {candidate.profile.portfolioUrl && (
                          <div className="flex items-center gap-3">
                            <Link className="text-muted-foreground h-4 w-4" />
                            <a
                              href={candidate.profile.portfolioUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Portfolio
                            </a>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Bio */}
                  {candidate.profile?.bio && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Giới thiệu</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed">{candidate.profile.bio}</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Experience Tab */}
                <TabsContent value="experience" className="space-y-4">
                  {candidate.candidateInfo?.experience &&
                  candidate.candidateInfo.experience.length > 0 ? (
                    candidate.candidateInfo.experience.map((exp) => (
                      <Card key={exp.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <h4 className="font-semibold">{exp.positionTitle}</h4>
                              <div className="text-muted-foreground flex items-center gap-3 text-sm">
                                <span className="flex items-center gap-1">
                                  <Building className="h-4 w-4" />
                                  {exp.companyName}
                                </span>
                                <Badge variant="outline">
                                  {employmentTypeLabels[exp.employmentType]}
                                </Badge>
                              </div>
                              <div className="text-muted-foreground text-sm">
                                {format(new Date(exp.startDate), 'MM/yyyy')} -{' '}
                                {exp.isCurrent
                                  ? 'Hiện tại'
                                  : exp.endDate
                                    ? format(new Date(exp.endDate), 'MM/yyyy')
                                    : 'Hiện tại'}
                              </div>
                            </div>
                          </div>
                          {exp.description && (
                            <p className="mt-3 text-sm leading-relaxed">{exp.description}</p>
                          )}
                          {exp.achievements && (
                            <div className="mt-3">
                              <p className="mb-1 text-sm font-medium">Thành tích:</p>
                              <p className="text-sm leading-relaxed">{exp.achievements}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-muted-foreground py-8 text-center">
                      Chưa có thông tin kinh nghiệm
                    </div>
                  )}
                </TabsContent>

                {/* Education Tab */}
                <TabsContent value="education" className="space-y-4">
                  {candidate.candidateInfo?.education &&
                  candidate.candidateInfo.education.length > 0 ? (
                    candidate.candidateInfo.education.map((edu) => (
                      <Card key={edu.id}>
                        <CardContent className="pt-6">
                          <div className="space-y-2">
                            <h4 className="font-semibold">{edu.fieldOfStudy}</h4>
                            <div className="text-muted-foreground flex items-center gap-3 text-sm">
                              <span className="flex items-center gap-1">
                                <GraduationCap className="h-4 w-4" />
                                {edu.institutionName}
                              </span>
                              <Badge variant="outline">{degreeTypeLabels[edu.degreeType]}</Badge>
                            </div>
                            <div className="text-muted-foreground text-sm">
                              {format(new Date(edu.startDate), 'MM/yyyy')} -{' '}
                              {edu.endDate ? format(new Date(edu.endDate), 'MM/yyyy') : 'Hiện tại'}
                            </div>
                            {edu.gpa && (
                              <div className="text-sm">
                                <span className="font-medium">GPA:</span> {edu.gpa}
                              </div>
                            )}
                            {edu.description && (
                              <p className="mt-2 text-sm leading-relaxed">{edu.description}</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-muted-foreground py-8 text-center">
                      Chưa có thông tin học vấn
                    </div>
                  )}
                </TabsContent>

                {/* Skills Tab */}
                <TabsContent value="skills" className="space-y-4">
                  {candidate.candidateInfo?.skills && candidate.candidateInfo.skills.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {candidate.candidateInfo.skills.map((skill) => (
                        <Card key={skill.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <h4 className="font-semibold">{skill.skill.name}</h4>
                                {skill.skill.category && (
                                  <p className="text-muted-foreground text-sm">
                                    {skill.skill.category}
                                  </p>
                                )}
                                <Badge variant="secondary">
                                  {proficiencyLevelLabels[skill.proficiencyLevel]}
                                </Badge>
                                {skill.yearsExperience && (
                                  <p className="text-muted-foreground text-sm">
                                    {skill.yearsExperience} năm kinh nghiệm
                                  </p>
                                )}
                              </div>
                              <div className="flex">
                                {[1, 2, 3, 4].map((level) => (
                                  <Star
                                    key={level}
                                    className={`h-4 w-4 ${
                                      level <=
                                      ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].indexOf(
                                        skill.proficiencyLevel
                                      ) +
                                        1
                                        ? 'fill-yellow-500 text-yellow-500'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground py-8 text-center">
                      Chưa có thông tin kỹ năng
                    </div>
                  )}
                </TabsContent>

                {/* Certifications Tab */}
                <TabsContent value="certifications" className="space-y-4">
                  {candidate.candidateInfo?.certifications &&
                  candidate.candidateInfo.certifications.length > 0 ? (
                    candidate.candidateInfo.certifications.map((cert) => (
                      <Card key={cert.id}>
                        <CardContent className="pt-6">
                          <div className="space-y-2">
                            <h4 className="font-semibold">{cert.certificationName}</h4>
                            <div className="text-muted-foreground flex items-center gap-3 text-sm">
                              <span className="flex items-center gap-1">
                                <Award className="h-4 w-4" />
                                {cert.issuingOrganization}
                              </span>
                            </div>
                            <div className="text-muted-foreground text-sm">
                              Cấp ngày: {format(new Date(cert.issueDate), 'dd/MM/yyyy')}
                              {cert.expiryDate && (
                                <span>
                                  {' '}
                                  - Hết hạn: {format(new Date(cert.expiryDate), 'dd/MM/yyyy')}
                                </span>
                              )}
                            </div>
                            {cert.credentialId && (
                              <div className="text-sm">
                                <span className="font-medium">Mã chứng chỉ:</span>{' '}
                                {cert.credentialId}
                              </div>
                            )}
                            {cert.credentialUrl && (
                              <a
                                href={cert.credentialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                              >
                                Xem chứng chỉ
                              </a>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-muted-foreground py-8 text-center">
                      Chưa có thông tin chứng chỉ
                    </div>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        ) : (
          <div className="text-muted-foreground py-8 text-center">Không có dữ liệu</div>
        )}
      </DialogContent>
    </Dialog>
  );
};
