-- Stage lesson publication without opening a closed course to students.
ALTER POLICY "Enrolled users can read released ABBA lessons"
ON public.abba_lessons TO authenticated
USING (
 is_published = true
 AND (release_at IS NULL OR release_at <= now())
 AND EXISTS (SELECT 1 FROM public.abba_courses c
             WHERE c.id = abba_lessons.course_id AND c.is_published
             AND abba_lessons.lesson_number <= c.total_lessons)
 AND EXISTS (SELECT 1 FROM public.abba_enrollments e
             WHERE e.course_id = abba_lessons.course_id
             AND e.user_id = (SELECT auth.uid()) AND e.status = 'active'
             AND (e.expires_at IS NULL OR e.expires_at > now()))
);
